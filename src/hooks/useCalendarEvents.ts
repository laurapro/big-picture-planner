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

  const addEvent = useCallback((startDate: string, endDate: string, title: string, color: PostItColor) => {
    const newEvent: CalendarEvent = {
      id: crypto.randomUUID(),
      startDate,
      endDate,
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

  const updateEvent = useCallback((id: string, updates: Partial<Omit<CalendarEvent, 'id'>>) => {
    setEvents((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, ...updates } : e));
      saveEvents(updated);
      return updated;
    });
  }, []);

  return { events, addEvent, removeEvent, updateEvent };
};
