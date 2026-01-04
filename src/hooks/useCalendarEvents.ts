import { useState, useCallback } from 'react';
import { CalendarEvent, PostItColor } from '@/types/calendar';

const STORAGE_KEY = 'big-ass-calendar-events';

const loadEvents = (): CalendarEvent[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveEvents = (events: CalendarEvent[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
};

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(loadEvents);

  const addEvent = useCallback((date: string, title: string, color: PostItColor) => {
    const newEvent: CalendarEvent = {
      id: crypto.randomUUID(),
      date,
      title,
      color,
    };
    setEvents((prev) => {
      const updated = [...prev, newEvent];
      saveEvents(updated);
      return updated;
    });
  }, []);

  const removeEvent = useCallback((id: string) => {
    setEvents((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveEvents(updated);
      return updated;
    });
  }, []);

  const getEventsForDate = useCallback(
    (date: string) => events.filter((e) => e.date === date),
    [events]
  );

  return { events, addEvent, removeEvent, getEventsForDate };
};
