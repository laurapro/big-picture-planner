import { useState, useMemo } from 'react';
import { CalendarHeader } from './CalendarHeader';
import { HorizontalCalendarGrid } from './HorizontalCalendarGrid';
import { AddEventDialog } from './AddEventDialog';
import { EditEventDialog } from './EditEventDialog';
import { TodoList } from './TodoList';
import { ColorLegend } from './ColorLegend';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useTodoList } from '@/hooks/useTodoList';
import { CalendarEvent } from '@/types/calendar';

export const BigAssCalendar = () => {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { events, addEvent, removeEvent, updateEvent } = useCalendarEvents();
  const { todos, addTodo, toggleTodo, removeTodo } = useTodoList();

  const handleCellClick = (date: string) => {
    setSelectedDate(date);
    setDialogOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEditDialogOpen(true);
  };

  const yearEvents = useMemo(() => {
    return events.filter((e) => {
      const startYear = parseInt(e.startDate.split('-')[0]);
      const endYear = parseInt(e.endDate.split('-')[0]);
      return startYear === year || endYear === year;
    });
  }, [events, year]);

  const existingEventsForSelected = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter((e) => {
      return e.startDate <= selectedDate && e.endDate >= selectedDate;
    });
  }, [selectedDate, events]);

  return (
    <div className="min-h-screen bg-background px-2 sm:px-4 pb-12">
      <CalendarHeader
        year={year}
        onPrevYear={() => setYear((y) => y - 1)}
        onNextYear={() => setYear((y) => y + 1)}
      />

      <div className="max-w-[1600px] mx-auto">
        <div className="bg-card rounded-xl shadow-card p-2 sm:p-4 mb-8">
          <HorizontalCalendarGrid
            year={year}
            events={yearEvents}
            onCellClick={handleCellClick}
            onEventClick={handleEventClick}
          />
        </div>

        <TodoList
          todos={todos}
          onAddTodo={addTodo}
          onToggleTodo={toggleTodo}
          onRemoveTodo={removeTodo}
        />
      </div>

      <ColorLegend className="mt-8" />

      <AddEventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedDate={selectedDate}
        existingEvents={existingEventsForSelected}
        onAddEvent={addEvent}
        onRemoveEvent={removeEvent}
      />

      <EditEventDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        event={editingEvent}
        onUpdateEvent={updateEvent}
        onRemoveEvent={removeEvent}
      />
    </div>
  );
};
