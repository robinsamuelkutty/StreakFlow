import { format } from "date-fns";
import { CalendarDays } from "lucide-react";

export function TodayHeader() {
  const today = new Date();
  
  return (
    <div className="flex items-center gap-4" data-testid="header-today">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
        <CalendarDays className="w-6 h-6 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-date">
          {format(today, "EEEE, MMMM d")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {format(today, "yyyy")}
        </p>
      </div>
    </div>
  );
}
