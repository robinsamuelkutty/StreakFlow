import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar, Flame } from "lucide-react";
import { format, subDays, startOfWeek, addDays } from "date-fns";
import type { DailyLog } from "@shared/schema";

interface ActivityHeatmapProps {
  logs: DailyLog[];
  isLoading?: boolean;
}

export function ActivityHeatmap({ logs, isLoading }: ActivityHeatmapProps) {
  const heatmapData = useMemo(() => {
    const today = new Date();
    const data: { date: Date; score: number | null }[] = [];
    
    const startDate = startOfWeek(subDays(today, 364), { weekStartsOn: 0 });
    const endDate = today;
    
    let current = startDate;
    while (current <= endDate) {
      const dateStr = format(current, "yyyy-MM-dd");
      const log = logs.find((l) => l.date === dateStr);
      data.push({
        date: new Date(current),
        score: log ? log.consistencyScore : null,
      });
      current = addDays(current, 1);
    }
    
    return data;
  }, [logs]);

  const weeks = useMemo(() => {
    const result: { date: Date; score: number | null }[][] = [];
    let currentWeek: { date: Date; score: number | null }[] = [];
    
    heatmapData.forEach((day, i) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || i === heatmapData.length - 1) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });
    
    return result;
  }, [heatmapData]);

  const months = useMemo(() => {
    const result: { label: string; index: number }[] = [];
    let lastMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
      const firstDayOfWeek = week[0]?.date;
      if (firstDayOfWeek) {
        const month = firstDayOfWeek.getMonth();
        if (month !== lastMonth) {
          result.push({
            label: format(firstDayOfWeek, "MMM"),
            index: weekIndex,
          });
          lastMonth = month;
        }
      }
    });
    
    return result;
  }, [weeks]);

  const getScoreColor = (score: number | null) => {
    if (score === null) return "bg-muted/30";
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-green-400/80";
    if (score >= 40) return "bg-green-300/60";
    if (score >= 20) return "bg-green-200/40";
    return "bg-green-100/20";
  };

  const currentStreak = useMemo(() => {
    let streak = 0;
    const today = format(new Date(), "yyyy-MM-dd");
    
    for (let i = 0; i <= 365; i++) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd");
      const log = logs.find((l) => l.date === date);
      if (log && log.consistencyScore > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  }, [logs]);

  return (
    <Card className="lg:col-span-2" data-testid="card-heatmap">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Activity
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Flame className="w-4 h-4 text-orange-500" />
          <span>{currentStreak} day streak</span>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-32 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading activity...</div>
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="relative">
              <div className="flex gap-1 mb-1 pl-8">
                {months.map((month) => (
                  <span
                    key={`${month.label}-${month.index}`}
                    className="text-xs text-muted-foreground absolute"
                    style={{ left: `${month.index * 13 + 32}px` }}
                  >
                    {month.label}
                  </span>
                ))}
              </div>
              
              <div className="flex gap-1 mt-5">
                <div className="flex flex-col gap-1 text-xs text-muted-foreground w-7 shrink-0">
                  <span className="h-3"></span>
                  <span className="h-3">Mon</span>
                  <span className="h-3"></span>
                  <span className="h-3">Wed</span>
                  <span className="h-3"></span>
                  <span className="h-3">Fri</span>
                  <span className="h-3"></span>
                </div>
                
                <div className="flex gap-1">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {week.map((day, dayIndex) => (
                        <Tooltip key={dayIndex}>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-3 h-3 rounded-sm cursor-pointer transition-transform hover:scale-125 ${getScoreColor(
                                day.score
                              )}`}
                              data-testid={`heatmap-cell-${format(day.date, "yyyy-MM-dd")}`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs">
                              <p className="font-medium">{format(day.date, "EEEE, MMM d, yyyy")}</p>
                              <p className="text-muted-foreground">
                                {day.score !== null
                                  ? `Score: ${day.score}/100`
                                  : "No activity recorded"}
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm bg-muted/30" />
                  <div className="w-3 h-3 rounded-sm bg-green-100/20" />
                  <div className="w-3 h-3 rounded-sm bg-green-200/40" />
                  <div className="w-3 h-3 rounded-sm bg-green-300/60" />
                  <div className="w-3 h-3 rounded-sm bg-green-400/80" />
                  <div className="w-3 h-3 rounded-sm bg-green-500" />
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
