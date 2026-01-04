import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PostItColor, CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string | null;
  existingEvents: CalendarEvent[];
  onAddEvent: (date: string, title: string, color: PostItColor) => void;
  onRemoveEvent: (id: string) => void;
}

const COLORS: { value: PostItColor; className: string }[] = [
  { value: 'yellow', className: 'bg-postit-yellow hover:ring-2 hover:ring-postit-yellow/50' },
  { value: 'pink', className: 'bg-postit-pink hover:ring-2 hover:ring-postit-pink/50' },
  { value: 'blue', className: 'bg-postit-blue hover:ring-2 hover:ring-postit-blue/50' },
  { value: 'green', className: 'bg-postit-green hover:ring-2 hover:ring-postit-green/50' },
  { value: 'orange', className: 'bg-postit-orange hover:ring-2 hover:ring-postit-orange/50' },
  { value: 'purple', className: 'bg-postit-purple hover:ring-2 hover:ring-postit-purple/50' },
];

const colorClasses: Record<PostItColor, string> = {
  yellow: 'bg-postit-yellow',
  pink: 'bg-postit-pink',
  blue: 'bg-postit-blue',
  green: 'bg-postit-green',
  orange: 'bg-postit-orange',
  purple: 'bg-postit-purple',
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
  const [color, setColor] = useState<PostItColor>('yellow');

  const formattedDate = selectedDate
    ? format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')
    : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && selectedDate) {
      onAddEvent(selectedDate, title.trim(), color);
      setTitle('');
      setColor('yellow');
    }
  };

  const handleClose = () => {
    setTitle('');
    setColor('yellow');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{formattedDate}</DialogTitle>
        </DialogHeader>

        {/* Existing events */}
        {existingEvents.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-muted-foreground">Events</p>
            <div className="space-y-2">
              {existingEvents.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg shadow-postit animate-fade-in',
                    colorClasses[event.color]
                  )}
                >
                  <span className="text-sm font-medium text-foreground/90">
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
              placeholder="Add a new event..."
              className="h-12 text-base"
              autoFocus
            />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Color</p>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all shadow-postit',
                    c.className,
                    color === c.value && 'ring-2 ring-offset-2 ring-foreground scale-110'
                  )}
                />
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full h-11" disabled={!title.trim()}>
            Add Event
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
