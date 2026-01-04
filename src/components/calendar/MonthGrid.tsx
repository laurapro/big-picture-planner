import { useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  isToday,
  isSameMonth,
} from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface MonthGridProps {
  year: number;
  month: number;
  events: CalendarEvent[];
  onDateClick: (date: string) => void;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const colorClasses: Record<string, string> = {
  yellow: 'bg-postit-yellow',
  pink: 'bg-postit-pink',
  blue: 'bg-postit-blue',
  green: 'bg-postit-green',
  orange: 'bg-postit-orange',
  purple: 'bg-postit-purple',
};

export const MonthGrid = ({ year, month, events, onDateClick }: MonthGridProps) => {
  const monthDate = new Date(year, month, 1);
  const monthName = format(monthDate, 'MMMM');

  const days = useMemo(() => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    return eachDayOfInterval({ start, end });
  }, [year, month]);

  const startDayOfWeek = getDay(days[0]);

  const getEventsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return events.filter((e) => e.date === dateStr);
  };

  return (
    <div className="flex flex-col">
      <h2 className="font-display text-lg md:text-xl font-semibold mb-2 tracking-wide">
        {monthName}
      </h2>
      <div className="grid grid-cols-7 gap-px text-xs">
        {WEEKDAYS.map((day, i) => (
          <div
            key={i}
            className="text-center text-muted-foreground font-medium py-1"
          >
            {day}
          </div>
        ))}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayEvents = getEventsForDay(day);
          const today = isToday(day);

          return (
            <button
              key={dateStr}
              onClick={() => onDateClick(dateStr)}
              className={cn(
                'aspect-square flex flex-col items-center justify-start p-0.5 rounded-sm transition-all hover:bg-accent/50 relative group',
                today && 'ring-2 ring-primary ring-offset-1 ring-offset-background'
              )}
            >
              <span
                className={cn(
                  'text-[10px] md:text-xs font-medium',
                  today && 'text-primary font-bold'
                )}
              >
                {format(day, 'd')}
              </span>
              {dayEvents.length > 0 && (
                <div className="flex flex-wrap gap-0.5 mt-0.5 justify-center">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        'w-1.5 h-1.5 md:w-2 md:h-2 rounded-full shadow-postit',
                        colorClasses[event.color]
                      )}
                      title={event.title}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[8px] text-muted-foreground">
                      +{dayEvents.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
