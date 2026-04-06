import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarHeaderProps {
  year: number;
  onPrevYear: () => void;
  onNextYear: () => void;
  onSyncIcal: () => void;
  isSyncing: boolean;
}

export const CalendarHeader = ({
  year,
  onPrevYear,
  onNextYear,
  onSyncIcal,
  isSyncing,
}: CalendarHeaderProps) => {
  const shortYear = String(year).slice(-2);

  return (
    <header className="flex items-center justify-center gap-4 py-6 md:py-8 flex-wrap">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevYear}
        className="h-10 w-10 rounded-full hover:bg-primary/10 transition-colors"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <h1 className="font-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-primary tracking-wide select-none">
        WHAT R WE DOING &apos;{shortYear}
      </h1>
      <Button
        variant="ghost"
        size="icon"
        onClick={onNextYear}
        className="h-10 w-10 rounded-full hover:bg-primary/10 transition-colors"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
      <Button
        variant="outline"
        onClick={onSyncIcal}
        disabled={isSyncing}
        className="h-10 px-3"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
        {isSyncing ? "Syncing..." : "Sync iCloud"}
      </Button>
    </header>
  );
};
