import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface YearHeaderProps {
  year: number;
  onPrevYear: () => void;
  onNextYear: () => void;
}

export const YearHeader = ({ year, onPrevYear, onNextYear }: YearHeaderProps) => {
  return (
    <header className="flex items-center justify-center gap-6 py-8">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevYear}
        className="h-12 w-12 rounded-full hover:bg-accent transition-colors"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
        {year}
      </h1>
      <Button
        variant="ghost"
        size="icon"
        onClick={onNextYear}
        className="h-12 w-12 rounded-full hover:bg-accent transition-colors"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </header>
  );
};
