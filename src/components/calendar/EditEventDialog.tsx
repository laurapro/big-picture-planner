import { useState, useEffect } from "react";
import { format, parseISO, isBefore, isAfter, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PostItColor, CalendarEvent } from "@/types/calendar";
import { cn } from "@/lib/utils";

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent | null;
  onUpdateEvent: (
    id: string,
    updates: Partial<Omit<CalendarEvent, "id">>,
  ) => void;
  onRemoveEvent: (id: string) => void;
}

const COLORS: { value: PostItColor; className: string; label: string }[] = [
  { value: "black", className: "bg-postit-black", label: "Búho 🐈‍⬛" },
  // { value: 'red', className: 'bg-postit-red', label: 'Red' },
  { value: "orange", className: "bg-postit-orange", label: "Concerts 🥁" },
  // { value: 'yellow', className: 'bg-postit-yellow', label: 'Dogs/Animals 🐶' },
  { value: "green", className: "bg-postit-green", label: "Martin 👶🏼" },
  { value: "blue", className: "bg-postit-blue", label: "Andy 🙎🏻‍♂️" },
  { value: "purple", className: "bg-postit-purple", label: "Travels ✈️" },
  { value: "pink", className: "bg-postit-pink", label: "Laura 💋" },
];

export const EditEventDialog = ({
  open,
  onOpenChange,
  event,
  onUpdateEvent,
  onRemoveEvent,
}: EditEventDialogProps) => {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState<PostItColor>("orange");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setColor(event.color);
      setStartDate(parseISO(event.startDate));
      setEndDate(parseISO(event.endDate));
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (event && title.trim() && startDate && endDate) {
      onUpdateEvent(event.id, {
        title: title.trim(),
        color,
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
      });
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (event) {
      onRemoveEvent(event.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-title text-2xl text-primary">
            Edit Event
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event name..."
            className="h-12 text-base font-handwritten text-lg"
            autoFocus
          />

          {/* Date range */}
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Start</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal h-10"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "MMM d") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      if (
                        date &&
                        endDate &&
                        isAfter(startOfDay(date), startOfDay(endDate))
                      ) {
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
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal h-10"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "MMM d") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      if (
                        date &&
                        startDate &&
                        isBefore(startOfDay(date), startOfDay(startDate))
                      ) {
                        setEndDate(startDate);
                      } else {
                        setEndDate(date);
                      }
                    }}
                    disabled={(date) =>
                      startDate
                        ? isBefore(startOfDay(date), startOfDay(startDate))
                        : false
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Color picker */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Color
            </p>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all shadow-sm",
                    c.className,
                    color === c.value &&
                      "ring-2 ring-offset-2 ring-foreground scale-110",
                  )}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1 h-11 font-title text-lg"
              disabled={!title.trim() || !startDate || !endDate}
            >
              Save Changes
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-11 w-11"
              onClick={handleDelete}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
