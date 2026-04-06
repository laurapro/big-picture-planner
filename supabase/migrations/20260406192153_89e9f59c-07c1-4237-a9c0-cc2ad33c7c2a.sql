ALTER TABLE public.calendar_events
ADD COLUMN IF NOT EXISTS source TEXT,
ADD COLUMN IF NOT EXISTS external_uid TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS calendar_events_source_external_uid_idx
ON public.calendar_events (source, external_uid)
WHERE source IS NOT NULL AND external_uid IS NOT NULL;