import { useMemo, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { TodayHeader } from "@/components/today-header";
import { ConsistencyScore } from "@/components/consistency-score";
import { QuoteWidget } from "@/components/quote-widget";
import { PrioritiesWidget } from "@/components/priorities-widget";
import { TaskList } from "@/components/task-list";
import { TimeBlocks } from "@/components/time-blocks";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import { ScoreTrendChart } from "@/components/score-trend-chart";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BarChart3, LogOut, User } from "lucide-react";
import type { Task, TimeBlock, DailyLog } from "@shared/schema";
import type { Category } from "@shared/schema";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks", today],
  });

  const { data: timeBlocks = [], isLoading: blocksLoading } = useQuery<TimeBlock[]>({
    queryKey: ["/api/time-blocks", today],
  });

  const { data: dailyLogs = [], isLoading: logsLoading } = useQuery<DailyLog[]>({
    queryKey: ["/api/daily-logs"],
  });

  const todayLog = useMemo(() => {
    return dailyLogs.find((log) => log.date === today);
  }, [dailyLogs, today]);

  const yesterdayLog = useMemo(() => {
    const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");
    return dailyLogs.find((log) => log.date === yesterday);
  }, [dailyLogs]);

  const streakDays = useMemo(() => {
    let streak = 0;
    for (let i = 0; i <= 365; i++) {
      const date = format(new Date(Date.now() - i * 86400000), "yyyy-MM-dd");
      const log = dailyLogs.find((l) => l.date === date);
      if (log && log.consistencyScore > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }, [dailyLogs]);

  const addTaskMutation = useMutation({
    mutationFn: (data: { title: string; category: Category; priority: number }) =>
      apiRequest("POST", "/api/tasks", { ...data, date: today }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", today] });
      toast({ title: "Task added" });
    },
    onError: () => {
      toast({ title: "Failed to add task", variant: "destructive" });
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: (taskId: string) => apiRequest("PATCH", `/api/tasks/${taskId}/toggle`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", today] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-logs"] });
    },
  });

  const updateTaskPriorityMutation = useMutation({
    mutationFn: ({ taskId, priority }: { taskId: string; priority: number }) =>
      apiRequest("PATCH", `/api/tasks/${taskId}/priority`, { priority }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", today] });
    },
  });

  const addBlockMutation = useMutation({
    mutationFn: (data: { label: string; startTime: string; endTime: string; category: Category }) =>
      apiRequest("POST", "/api/time-blocks", { ...data, date: today }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-blocks", today] });
      toast({ title: "Time block added" });
    },
    onError: () => {
      toast({ title: "Failed to add time block", variant: "destructive" });
    },
  });

  const toggleBlockMutation = useMutation({
    mutationFn: (blockId: string) => apiRequest("PATCH", `/api/time-blocks/${blockId}/toggle`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-blocks", today] });
      queryClient.invalidateQueries({ queryKey: ["/api/daily-logs"] });
    },
  });

  const handleAddTask = useCallback(
    (title: string, category: Category = "general", priority: number = 0) => {
      addTaskMutation.mutate({ title, category, priority });
    },
    [addTaskMutation]
  );

  const handleToggleTask = useCallback(
    (taskId: string) => {
      toggleTaskMutation.mutate(taskId);
    },
    [toggleTaskMutation]
  );

  const handleTogglePriority = useCallback(
    (taskId: string, priority: number) => {
      updateTaskPriorityMutation.mutate({ taskId, priority });
    },
    [updateTaskPriorityMutation]
  );

  const handleAddBlock = useCallback(
    (block: { label: string; startTime: string; endTime: string; category: Category }) => {
      addBlockMutation.mutate(block);
    },
    [addBlockMutation]
  );

  const handleToggleBlock = useCallback(
    (blockId: string) => {
      toggleBlockMutation.mutate(blockId);
    },
    [toggleBlockMutation]
  );

  const handleAddPriority = useCallback(
    (title: string) => {
      addTaskMutation.mutate({ title, category: "general", priority: 1 });
    },
    [addTaskMutation]
  );

  const handleLogout = async () => {
    await logout();
    toast({ title: "Logged out successfully" });
  };

  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background" data-testid="page-dashboard">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold hidden sm:inline">Consistency</span>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="flex items-center gap-2" disabled>
                  <User className="w-4 h-4" />
                  <span className="truncate">{user?.email}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 text-destructive"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <TodayHeader />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ConsistencyScore
            score={todayLog?.consistencyScore || 0}
            previousScore={yesterdayLog?.consistencyScore}
            streakDays={streakDays}
          />

          <div className="space-y-6">
            <QuoteWidget />
            <PrioritiesWidget
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddPriority}
              isLoading={tasksLoading}
            />
          </div>

          <TaskList
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onTogglePriority={handleTogglePriority}
            isLoading={tasksLoading}
          />

          <TimeBlocks
            blocks={timeBlocks}
            onAddBlock={handleAddBlock}
            onToggleBlock={handleToggleBlock}
            isLoading={blocksLoading}
          />

          <ScoreTrendChart logs={dailyLogs} isLoading={logsLoading} />

          <ActivityHeatmap logs={dailyLogs} isLoading={logsLoading} />
        </div>
      </main>
    </div>
  );
}
