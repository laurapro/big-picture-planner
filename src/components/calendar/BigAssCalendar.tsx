import { useState, useMemo } from 'react';
import { YearHeader } from './YearHeader';
import { MonthGrid } from './MonthGrid';
import { AddEventDialog } from './AddEventDialog';
import { TodoList } from './TodoList';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useTodoList } from '@/hooks/useTodoList';

const MONTHS = Array.from({ length: 12 }, (_, i) => i);

export const BigAssCalendar = () => {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { events, addEvent, removeEvent, getEventsForDate } = useCalendarEvents();
  const { todos, addTodo, toggleTodo, removeTodo } = useTodoList();

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setDialogOpen(true);
  };

  const existingEventsForSelected = useMemo(
    () => (selectedDate ? getEventsForDate(selectedDate) : []),
    [selectedDate, getEventsForDate]
  );

  return (
    <div className="min-h-screen bg-background px-4 pb-12">
      <YearHeader
        year={year}
        onPrevYear={() => setYear((y) => y - 1)}
        onNextYear={() => setYear((y) => y + 1)}
      />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 mb-12">
          {MONTHS.map((month) => (
            <MonthGrid
              key={month}
              year={year}
              month={month}
              events={events.filter((e) => {
                const eventYear = parseInt(e.date.split('-')[0]);
                const eventMonth = parseInt(e.date.split('-')[1]) - 1;
                return eventYear === year && eventMonth === month;
              })}
              onDateClick={handleDateClick}
            />
          ))}
        </div>

        <TodoList
          todos={todos}
          onAddTodo={addTodo}
          onToggleTodo={toggleTodo}
          onRemoveTodo={removeTodo}
        />
      </div>

      <AddEventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedDate={selectedDate}
        existingEvents={existingEventsForSelected}
        onAddEvent={addEvent}
        onRemoveEvent={removeEvent}
      />
    </div>
  );
};
