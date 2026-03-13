import { cn } from "@/lib/utils";

type LegendItem = {
  colorClassName: string;
  label: string;
};

const DEFAULT_LEGEND: LegendItem[] = [
  { colorClassName: "bg-postit-blue", label: "🙎🏻‍♂️ Andy" },
  { colorClassName: "bg-postit-pink", label: "💋 Laura" },
  { colorClassName: "bg-postit-green", label: "👶🏼 Martin" },
  { colorClassName: "bg-postit-purple", label: "✈️ Travels" },
  { colorClassName: "bg-postit-black", label: "🐈‍⬛ Búho" },
  // { colorClassName: 'bg-postit-red', label: '❤️ Red' },
  { colorClassName: "bg-postit-orange", label: "🥁 Concerts" },
  // { colorClassName: "bg-postit-yellow", label: "🐶 Dogs/Animals" },
];

export function ColorLegend({
  items = DEFAULT_LEGEND,
  className,
}: {
  items?: LegendItem[];
  className?: string;
}) {
  return (
    <div className={cn("max-w-[1600px] mx-auto px-2 sm:px-4", className)}>
      <div className="bg-card rounded-xl shadow-card p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm font-semibold text-foreground">Legend</div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {items.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-block h-3.5 w-3.5 rounded-sm border border-border shadow-sm",
                    item.colorClassName,
                  )}
                />
                <span className="text-sm text-muted-foreground">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
