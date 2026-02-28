
-- Calendar events table
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  title TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'orange',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read events" ON public.calendar_events FOR SELECT USING (true);
CREATE POLICY "Anyone can insert events" ON public.calendar_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update events" ON public.calendar_events FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete events" ON public.calendar_events FOR DELETE USING (true);

-- Todo items table
CREATE TABLE public.todo_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.todo_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read todos" ON public.todo_items FOR SELECT USING (true);
CREATE POLICY "Anyone can insert todos" ON public.todo_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update todos" ON public.todo_items FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete todos" ON public.todo_items FOR DELETE USING (true);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.calendar_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.todo_items;
