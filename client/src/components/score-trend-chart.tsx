import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { format, subDays } from "date-fns";
import type { DailyLog } from "@shared/schema";

interface ScoreTrendChartProps {
  logs: DailyLog[];
  isLoading?: boolean;
}

export function ScoreTrendChart({ logs, isLoading }: ScoreTrendChartProps) {
  const chartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const dateStr = format(date, "yyyy-MM-dd");
      const log = logs.find((l) => l.date === dateStr);
      return {
        date: format(date, "MMM d"),
        fullDate: dateStr,
        score: log?.consistencyScore ?? null,
      };
    });
    return last30Days;
  }, [logs]);

  const averageScore = useMemo(() => {
    const scores = chartData.filter((d) => d.score !== null).map((d) => d.score as number);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [chartData]);

  const trend = useMemo(() => {
    const scores = chartData.filter((d) => d.score !== null).map((d) => d.score as number);
    if (scores.length < 7) return null;
    
    const recent = scores.slice(-7);
    const previous = scores.slice(-14, -7);
    
    if (previous.length === 0) return null;
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;
    
    return Math.round(recentAvg - previousAvg);
  }, [chartData]);

  return (
    <Card data-testid="card-score-trend">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Score Trend
        </CardTitle>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-muted-foreground">
            Avg: <span className="text-foreground font-medium">{averageScore}</span>
          </div>
          {trend !== null && (
            <div
              className={`font-medium ${
                trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "text-muted-foreground"
              }`}
            >
              {trend > 0 ? "+" : ""}{trend} vs last week
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading chart...</div>
          </div>
        ) : chartData.every((d) => d.score === null) ? (
          <div className="h-64 flex items-center justify-center text-center">
            <div className="text-muted-foreground">
              <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No score data yet</p>
              <p className="text-xs mt-1">Complete tasks and time blocks to see your trends</p>
            </div>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                  width={30}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
                        <p className="text-sm font-medium">{data.date}</p>
                        <p className="text-sm text-muted-foreground">
                          Score: {data.score !== null ? data.score : "No data"}
                        </p>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                  activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
