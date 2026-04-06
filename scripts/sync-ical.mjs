#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";

const REQUIRED_ENV = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "ICAL_URL",
];

const SYNC_SOURCE = "icloud";
const DEFAULT_COLOR = process.env.ICAL_SYNC_COLOR || "purple";
const LOOKAHEAD_DAYS = Number(process.env.ICAL_SYNC_LOOKAHEAD_DAYS || "365");
const LOOKBACK_DAYS = Number(process.env.ICAL_SYNC_LOOKBACK_DAYS || "30");

function assertEnv() {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
    process.exit(1);
  }
}

function decodeIcsText(value) {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

function unfoldIcsLines(ics) {
  return ics
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .reduce((lines, line) => {
      if ((line.startsWith(" ") || line.startsWith("\t")) && lines.length > 0) {
        lines[lines.length - 1] += line.slice(1);
      } else {
        lines.push(line);
      }
      return lines;
    }, []);
}

function parseIcsDate(raw, isDateOnly) {
  if (isDateOnly) {
    const year = Number(raw.slice(0, 4));
    const month = Number(raw.slice(4, 6));
    const day = Number(raw.slice(6, 8));
    return new Date(Date.UTC(year, month - 1, day));
  }

  // Example formats:
  // - 20260406T133000Z
  // - 20260406T133000
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

function toIsoDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseEvents(icsText) {
  const lines = unfoldIcsLines(icsText);
  const events = [];
  let inEvent = false;
  let current = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      current = {};
      continue;
    }

    if (line === "END:VEVENT") {
      inEvent = false;
      if (current?.uid && current?.title && current?.startDate && current?.endDate) {
        events.push(current);
      }
      current = null;
      continue;
    }

    if (!inEvent || !current) {
      continue;
    }

    const colonIndex = line.indexOf(":");
    if (colonIndex < 0) {
      continue;
    }

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
      current._startIsDateOnly = isDateOnly;
    } else if (key === "DTEND") {
      const isDateOnly = params.includes("VALUE=DATE");
      const end = parseIcsDate(valuePart.trim(), isDateOnly);

      // For all-day events, ICS DTEND is exclusive, so we store inclusive end date.
      if (isDateOnly) {
        end.setUTCDate(end.getUTCDate() - 1);
      }

      current.endDate = toIsoDateLocal(end);
      current._endIsDateOnly = isDateOnly;
    }
  }

  return events.filter((event) => !event.uid.includes("_R"));
}

function withinSyncWindow(startDate) {
  const now = new Date();
  const min = new Date(now);
  min.setDate(min.getDate() - LOOKBACK_DAYS);
  const max = new Date(now);
  max.setDate(max.getDate() + LOOKAHEAD_DAYS);
  const eventDate = new Date(`${startDate}T00:00:00`);
  return eventDate >= min && eventDate <= max;
}

async function main() {
  assertEnv();

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  const res = await fetch(process.env.ICAL_URL);
  if (!res.ok) {
    throw new Error(`Unable to fetch ICAL_URL: ${res.status} ${res.statusText}`);
  }

  const icsText = await res.text();
  const parsedEvents = parseEvents(icsText).filter((event) =>
    withinSyncWindow(event.startDate)
  );

  const { data: existing, error: fetchError } = await supabase
    .from("calendar_events")
    .select("id, external_uid, source")
    .eq("source", SYNC_SOURCE);

  if (fetchError) {
    throw fetchError;
  }

  const existingByUid = new Map(existing.map((row) => [row.external_uid, row]));
  const seenUids = new Set();
  let inserted = 0;
  let updated = 0;

  for (const event of parsedEvents) {
    seenUids.add(event.uid);

    const existingRow = existingByUid.get(event.uid);
    const payload = {
      start_date: event.startDate,
      end_date: event.endDate,
      title: event.title,
      color: DEFAULT_COLOR,
      source: SYNC_SOURCE,
      external_uid: event.uid,
    };

    if (existingRow) {
      const { error } = await supabase
        .from("calendar_events")
        .update(payload)
        .eq("id", existingRow.id);
      if (error) {
        throw error;
      }
      updated += 1;
    } else {
      const { error } = await supabase.from("calendar_events").insert(payload);
      if (error) {
        throw error;
      }
      inserted += 1;
    }
  }

  const staleIds = existing
    .filter((row) => !seenUids.has(row.external_uid))
    .map((row) => row.id);

  let removed = 0;
  if (staleIds.length > 0) {
    const { error } = await supabase
      .from("calendar_events")
      .delete()
      .in("id", staleIds);
    if (error) {
      throw error;
    }
    removed = staleIds.length;
  }

  console.log(
    `iCal sync complete. Inserted: ${inserted}, Updated: ${updated}, Removed: ${removed}, Total in feed: ${parsedEvents.length}`
  );
}

main().catch((error) => {
  console.error("iCal sync failed:", error.message || error);
  process.exit(1);
});
