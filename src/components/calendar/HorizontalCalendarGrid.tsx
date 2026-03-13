import { useMemo } from 'react';
import { format, getDaysInMonth, getDay, isToday } from 'date-fns';
import { CalendarEvent, PostItColor } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface HorizontalCalendarGridProps {
  year: number;
  events: CalendarEvent[];
  onCellClick: (date: string, month: number, day: number) => void;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const colorClasses: Record<PostItColor, string> = {
  yellow: 'bg-postit-yellow',
  pink: 'bg-postit-pink',
  blue: 'bg-postit-blue',
  green: 'bg-postit-green',
  orange: 'bg-postit-orange',
  purple: 'bg-postit-purple',
  red: 'bg-postit-red',
};

interface EventBlock {
  event: CalendarEvent;
  startDay: number;
  endDay: number;
  row: number;
}

export const HorizontalCalendarGrid = ({ year, events, onCellClick }: HorizontalCalendarGridProps) => {
  // Calculate which events span which cells for each month
  const eventsByMonth = useMemo(() => {
    const result: Map<number, EventBlock[]> = new Map();

    for (let month = 0; month < 12; month++) {
      result.set(month, []);
    }

    events.forEach((event) => {
      const startParts = event.startDate.split('-').map(Number);
      const endParts = event.endDate.split('-').map(Number);
      
      const startYear = startParts[0];
      const startMonth = startParts[1] - 1;
      const startDay = startParts[2];
      const endYear = endParts[0];
      const endMonth = endParts[1] - 1;
      const endDay = endParts[2];

      // Handle events that span across months
      for (let month = startMonth; month <= endMonth; month++) {
        if (startYear !== year && endYear !== year) continue;
        if (month < 0 || month > 11) continue;

        const daysInMonth = getDaysInMonth(new Date(year, month));
        const effectiveStartDay = month === startMonth ? startDay : 1;
        const effectiveEndDay = month === endMonth ? endDay : daysInMonth;

        const monthEvents = result.get(month) || [];
        
        // Find available row (simple placement - find first non-overlapping row)
        let row = 0;
        const overlaps = (r: number) => monthEvents.some(
          (e) => e.row === r && !(effectiveEndDay < e.startDay || effectiveStartDay > e.endDay)
        );
        while (overlaps(row)) row++;

        monthEvents.push({
          event,
          startDay: effectiveStartDay,
          endDay: effectiveEndDay,
          row,
        });
        result.set(month, monthEvents);
      }
    });

    return result;
  }, [events, year]);

  const isWeekend = (year: number, month: number, day: number): boolean => {
    const date = new Date(year, month, day);
    const dayOfWeek = getDay(date);
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const isDayValid = (month: number, day: number): boolean => {
    return day <= getDaysInMonth(new Date(year, month));
  };

  const formatDateStr = (month: number, day: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-[900px] lg:min-w-full">
        {/* Day numbers header */}
        <div className="flex border-b border-calendar-border">
          <div className="w-16 md:w-20 flex-shrink-0" /> {/* Month label space */}
          {DAYS.map((day) => (
            <div
              key={day}
              className="flex-1 min-w-[28px] text-center text-[10px] md:text-xs font-semibold text-foreground/70 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Month rows */}
        {MONTHS.map((monthName, monthIndex) => {
          const monthEvents = eventsByMonth.get(monthIndex) || [];
          const maxRow = monthEvents.length > 0 ? Math.max(...monthEvents.map((e) => e.row)) : -1;
          const rowCount = Math.max(maxRow + 1, 1);
          
          return (
            <div key={monthName} className="flex border-b border-calendar-border relative">
              {/* Month label */}
              <div className="w-16 md:w-20 flex-shrink-0 flex items-center justify-center font-title text-sm md:text-lg text-primary bg-background sticky left-0 z-10">
                {monthName}
              </div>

              {/* Day cells */}
              <div className="flex-1 flex relative" style={{ minHeight: `${Math.max(40, rowCount * 24 + 16)}px` }}>
                {DAYS.map((day) => {
                  const valid = isDayValid(monthIndex, day);
                  const weekend = valid && isWeekend(year, monthIndex, day);
                  const today = valid && isToday(new Date(year, monthIndex, day));

                  return (
                    <div
                      key={day}
                      onClick={() => valid && onCellClick(formatDateStr(monthIndex, day), monthIndex, day)}
                      className={cn(
                        'flex-1 min-w-[28px] border-r border-calendar-border relative',
                        valid ? 'cursor-pointer hover:bg-primary/5' : 'bg-muted/60 day-invalid',
                        weekend && valid && 'bg-calendar-weekend',
                        !weekend && valid && 'bg-calendar-weekday',
                        today && 'ring-2 ring-inset ring-primary'
                      )}
                    />
                  );
                })}

                {/* Event blocks overlay */}
                <div className="absolute inset-0 pointer-events-none" style={{ marginLeft: '0' }}>
                  {monthEvents.map((block, idx) => {
                    const leftPercent = ((block.startDay - 1) / 31) * 100;
                    const widthPercent = ((block.endDay - block.startDay + 1) / 31) * 100;

                    return (
                      <div
                        key={`${block.event.id}-${idx}`}
                        className={cn(
                          'absolute pointer-events-auto cursor-pointer rounded-sm px-1 flex items-center overflow-hidden shadow-sm transition-transform hover:scale-[1.02] hover:z-20',
                          colorClasses[block.event.color]
                        )}
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                          top: `${4 + block.row * 24}px`,
                          height: '20px',
                        }}
                        title={block.event.title}
                      >
                        <span className="text-xs md:text-sm font-semibold text-foreground/90 truncate whitespace-nowrap">
                          {block.event.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
