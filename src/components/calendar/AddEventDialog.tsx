import { useState, useEffect } from 'react';
import { format, parseISO, isBefore, isAfter, startOfDay } from 'date-fns';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { PostItColor, CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string | null;
  existingEvents: CalendarEvent[];
  onAddEvent: (startDate: string, endDate: string, title: string, color: PostItColor) => void;
  onRemoveEvent: (id: string) => void;
}

const COLORS: { value: PostItColor; className: string; label: string }[] = [
  { value: 'red', className: 'bg-postit-red', label: 'Red' },
  { value: 'orange', className: 'bg-postit-orange', label: 'Orange' },
  { value: 'yellow', className: 'bg-postit-yellow', label: 'Yellow' },
  { value: 'green', className: 'bg-postit-green', label: 'Green' },
  { value: 'blue', className: 'bg-postit-blue', label: 'Blue' },
  { value: 'purple', className: 'bg-postit-purple', label: 'Purple' },
  { value: 'pink', className: 'bg-postit-pink', label: 'Pink' },
];

const colorClasses: Record<PostItColor, string> = {
  yellow: 'bg-postit-yellow',
  pink: 'bg-postit-pink',
  blue: 'bg-postit-blue',
  green: 'bg-postit-green',
  orange: 'bg-postit-orange',
  purple: 'bg-postit-purple',
  red: 'bg-postit-red',
};

export const AddEventDialog = ({
  open,
  onOpenChange,
  selectedDate,
  existingEvents,
  onAddEvent,
  onRemoveEvent,
}: AddEventDialogProps) => {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState<PostItColor>('orange');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  useEffect(() => {
    if (selectedDate) {
      const date = parseISO(selectedDate);
      setStartDate(date);
      setEndDate(date);
    }
  }, [selectedDate]);

  const formattedDate = selectedDate
    ? format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')
    : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && startDate && endDate) {
      const start = format(startDate, 'yyyy-MM-dd');
      const end = format(endDate, 'yyyy-MM-dd');
      onAddEvent(start, end, title.trim(), color);
      setTitle('');
      setColor('orange');
    }
  };

  const handleClose = () => {
    setTitle('');
    setColor('orange');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-title text-2xl text-primary">{formattedDate}</DialogTitle>
        </DialogHeader>

        {/* Existing events */}
        {existingEvents.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-muted-foreground">Events on this day</p>
            <div className="space-y-2">
              {existingEvents.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg shadow-sm',
                    colorClasses[event.color]
                  )}
                >
                  <span className="font-handwritten text-lg font-bold text-foreground/90">
                    {event.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-foreground/10"
                    onClick={() => onRemoveEvent(event.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add new event form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event name..."
              className="h-12 text-base font-handwritten text-lg"
              autoFocus
            />
          </div>

          {/* Date range */}
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Start</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal h-10">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'MMM d') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      if (date && endDate && isAfter(startOfDay(date), startOfDay(endDate))) {
                        setEndDate(date);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <span className="text-muted-foreground mt-5">→</span>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">End</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal h-10">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'MMM d') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      if (date && startDate && isBefore(startOfDay(date), startOfDay(startDate))) {
                        setEndDate(startDate);
                      } else {
                        setEndDate(date);
                      }
                    }}
                    disabled={(date) => startDate ? isBefore(startOfDay(date), startOfDay(startDate)) : false}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Color picker */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Color</p>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all shadow-sm',
                    c.className,
                    color === c.value && 'ring-2 ring-offset-2 ring-foreground scale-110'
                  )}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full h-11 font-title text-lg" disabled={!title.trim() || !startDate || !endDate}>
            Add Event
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
