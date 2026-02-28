import { useState, useCallback, useEffect } from 'react';
import { CalendarEvent, PostItColor } from '@/types/calendar';
import { supabase } from '@/integrations/supabase/client';

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Load events from database
  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*');
      if (!error && data) {
        setEvents(data.map((e: any) => ({
          id: e.id,
          startDate: e.start_date,
          endDate: e.end_date,
          title: e.title,
          color: e.color as PostItColor,
        })));
      }
    };
    fetchEvents();

    // Realtime subscription
    const channel = supabase
      .channel('calendar_events_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_events' }, () => {
        fetchEvents();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const addEvent = useCallback(async (startDate: string, endDate: string, title: string, color: PostItColor) => {
    await supabase.from('calendar_events').insert({
      start_date: startDate,
      end_date: endDate,
      title,
      color,
    });
  }, []);

  const removeEvent = useCallback(async (id: string) => {
    await supabase.from('calendar_events').delete().eq('id', id);
  }, []);

  const updateEvent = useCallback(async (id: string, updates: Partial<Omit<CalendarEvent, 'id'>>) => {
    const dbUpdates: any = {};
    if (updates.startDate) dbUpdates.start_date = updates.startDate;
    if (updates.endDate) dbUpdates.end_date = updates.endDate;
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.color) dbUpdates.color = updates.color;
    await supabase.from('calendar_events').update(dbUpdates).eq('id', id);
  }, []);

  return { events, addEvent, removeEvent, updateEvent };
};
