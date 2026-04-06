import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SYNC_SOURCE = "icloud";
const DEFAULT_COLOR = "purple";
const LOOKAHEAD_DAYS = 365;
const LOOKBACK_DAYS = 30;

type ParsedEvent = {
  uid: string;
  title: string;
  startDate: string;
  endDate: string;
};

function decodeIcsText(value: string) {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

function unfoldIcsLines(ics: string) {
  return ics
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .reduce<string[]>((lines, line) => {
      if ((line.startsWith(" ") || line.startsWith("\t")) && lines.length > 0) {
        lines[lines.length - 1] += line.slice(1);
      } else {
        lines.push(line);
      }
      return lines;
    }, []);
}

function parseIcsDate(raw: string, isDateOnly: boolean) {
  if (isDateOnly) {
    const year = Number(raw.slice(0, 4));
    const month = Number(raw.slice(4, 6));
    const day = Number(raw.slice(6, 8));
    return new Date(Date.UTC(year, month - 1, day));
  }

  const year = Number(raw.slice(0, 4));
  const month = Number(raw.slice(4, 6));
  const day = Number(raw.slice(6, 8));
  const hour = Number(raw.slice(9, 11));
  const minute = Number(raw.slice(11, 13));
  const second = Number(raw.slice(13, 15) || "0");

  if (raw.endsWith("Z")) {
    return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  }

  return new Date(year, month - 1, day, hour, minute, second);
}

function toIsoDateLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseEvents(icsText: string): ParsedEvent[] {
  const lines = unfoldIcsLines(icsText);
  const events: ParsedEvent[] = [];
  let inEvent = false;
  let current: Partial<ParsedEvent> | null = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      current = {};
      continue;
    }

    if (line === "END:VEVENT") {
      inEvent = false;
      if (current?.uid && current?.title && current?.startDate && current?.endDate) {
        events.push(current as ParsedEvent);
      }
      current = null;
      continue;
    }

    if (!inEvent || !current) continue;

    const colonIndex = line.indexOf(":");
    if (colonIndex < 0) continue;

    const keyPart = line.slice(0, colonIndex);
    const valuePart = line.slice(colonIndex + 1);
    const [rawKey, ...paramParts] = keyPart.split(";");
    const key = rawKey.toUpperCase();
    const params = paramParts.join(";").toUpperCase();

    if (key === "UID") {
      current.uid = valuePart.trim();
    } else if (key === "SUMMARY") {
      current.title = decodeIcsText(valuePart.trim());
    } else if (key === "DTSTART") {
      const isDateOnly = params.includes("VALUE=DATE");
      const start = parseIcsDate(valuePart.trim(), isDateOnly);
      current.startDate = toIsoDateLocal(start);
    } else if (key === "DTEND") {
      const isDateOnly = params.includes("VALUE=DATE");
      const end = parseIcsDate(valuePart.trim(), isDateOnly);
      if (isDateOnly) end.setUTCDate(end.getUTCDate() - 1);
      current.endDate = toIsoDateLocal(end);
    }
  }

  return events.filter((event) => !event.uid.includes("_R"));
}

function withinSyncWindow(startDate: string) {
  const now = new Date();
  const min = new Date(now);
  min.setDate(min.getDate() - LOOKBACK_DAYS);
  const max = new Date(now);
  max.setDate(max.getDate() + LOOKAHEAD_DAYS);
  const eventDate = new Date(`${startDate}T00:00:00`);
  return eventDate >= min && eventDate <= max;
}

export function useIcalSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const icalUrl = useMemo(
    () => (import.meta.env.VITE_ICAL_URL as string | undefined) ?? "https://p50-caldav.icloud.com/published/2/MTMwMzIyMDE2MTEzMDMyMv2OiK7h7jvGkRJ7g62AHkO9DvizN60lVjnmPQAVtvJVxExQxBVVOS5NLeFf3HIHkxbNgDjV_DugOZiJrSGBijg",
    []
  );

  const syncNow = useCallback(async () => {
    if (!icalUrl) {
      toast.error("Missing VITE_ICAL_URL in env");
      return;
    }

    setIsSyncing(true);
    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke("fetch-ical", {
        body: { url: icalUrl },
      });
      if (fnError) throw new Error(fnError.message ?? "Edge function error");
      if (!fnData?.ics) throw new Error("No iCal data returned");

      const icsText = fnData.ics as string;
      const parsedEvents = parseEvents(icsText).filter((event) =>
        withinSyncWindow(event.startDate)
      );

      const { data: existing, error: fetchError } = await (supabase
        .from("calendar_events")
        .select("id, external_uid, source")
        .eq("source", SYNC_SOURCE) as any);

      if (fetchError) throw fetchError;

      const existingByUid = new Map(
        ((existing as any[]) ?? []).map((row: any) => [row.external_uid, row])
      );
      const seenUids = new Set<string>();
      let inserted = 0;
      let updated = 0;

      for (const event of parsedEvents) {
        seenUids.add(event.uid);
        const existingRow = existingByUid.get(event.uid);
        if (existingRow) {
          // Only update dates, preserve user's color and title customizations
          const updatePayload: Record<string, string> = {
            start_date: event.startDate,
            end_date: event.endDate,
          };
          const { error } = await supabase
            .from("calendar_events")
            .update(updatePayload)
            .eq("id", existingRow.id);
          if (error) throw error;
          updated += 1;
        } else {
          const { error } = await supabase.from("calendar_events").insert({
            start_date: event.startDate,
            end_date: event.endDate,
            title: event.title,
            color: DEFAULT_COLOR,
            source: SYNC_SOURCE,
            external_uid: event.uid,
          });
          if (error) throw error;
          inserted += 1;
        }
      }

      const staleIds = (existing ?? [])
        .filter((row) => row.external_uid && !seenUids.has(row.external_uid))
        .map((row) => row.id);

      let removed = 0;
      if (staleIds.length > 0) {
        const { error } = await supabase
          .from("calendar_events")
          .delete()
          .in("id", staleIds);
        if (error) throw error;
        removed = staleIds.length;
      }

      toast.success(
        `Synced iCloud events (new: ${inserted}, updated: ${updated}, removed: ${removed})`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown sync error";
      toast.error(`iCloud sync failed: ${message}`);
    } finally {
      setIsSyncing(false);
    }
  }, [icalUrl]);

  return { syncNow, isSyncing };
}
