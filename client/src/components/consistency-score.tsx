import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ConsistencyScoreProps {
  score: number;
  previousScore?: number;
  streakDays: number;
}

export function ConsistencyScore({ score, previousScore, streakDays }: ConsistencyScoreProps) {
  const change = useMemo(() => {
    if (previousScore === undefined) return null;
    return score - previousScore;
  }, [score, previousScore]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#eab308";
    if (score >= 40) return "#f97316";
    return "#ef4444";
  };

  const circumference = 2 * Math.PI * 80;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className="relative overflow-visible" data-testid="card-consistency-score">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center justify-between gap-2">
          Consistency Score
          {streakDays > 0 && (
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {streakDays} day streak
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-4 pb-6">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg
            className="absolute transform -rotate-90"
            width="192"
            height="192"
            viewBox="0 0 192 192"
          >
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-muted/30"
            />
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke={getScoreRingColor(score)}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="flex flex-col items-center z-10">
            <span
              className={`text-6xl font-bold ${getScoreColor(score)}`}
              data-testid="text-score-value"
            >
              {score}
            </span>
            <span className="text-sm text-muted-foreground mt-1">out of 100</span>
          </div>
        </div>
        
        {change !== null && (
          <div className="flex items-center gap-1 mt-4" data-testid="text-score-change">
            {change > 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500">+{change} from yesterday</span>
              </>
            ) : change < 0 ? (
              <>
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-500">{change} from yesterday</span>
              </>
            ) : (
              <>
                <Minus className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Same as yesterday</span>
              </>
            )}
          </div>
        )}
        
        <p className="text-xs text-muted-foreground mt-2">
          Based on last 7 days
        </p>
      </CardContent>
    </Card>
  );
}
