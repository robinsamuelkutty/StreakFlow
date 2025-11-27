import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Star } from "lucide-react";
import type { Task } from "@shared/schema";
import { categories } from "@shared/schema";

interface PrioritiesWidgetProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string) => void;
  isLoading?: boolean;
}

export function PrioritiesWidget({ tasks, onToggleTask, onAddTask, isLoading }: PrioritiesWidgetProps) {
  const [newTask, setNewTask] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const topPriorities = tasks
    .filter((t) => t.priority > 0)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3);

  const handleAddTask = () => {
    if (newTask.trim()) {
      onAddTask(newTask.trim());
      setNewTask("");
      setIsAdding(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find((c) => c.value === category);
    return cat?.color || "#6b7280";
  };

  return (
    <Card data-testid="card-priorities">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Top Priorities
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsAdding(!isAdding)}
          data-testid="button-add-priority"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {isAdding && (
          <div className="flex gap-2">
            <Input
              placeholder="Add a priority..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              className="h-9"
              autoFocus
              data-testid="input-new-priority"
            />
            <Button size="sm" onClick={handleAddTask} data-testid="button-save-priority">
              Add
            </Button>
          </div>
        )}
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-5 h-5 rounded bg-muted animate-pulse" />
                <div className="flex-1 h-4 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        ) : topPriorities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No priorities set for today</p>
            <p className="text-xs mt-1">Mark tasks as priority to see them here</p>
          </div>
        ) : (
          <div className="space-y-1">
            {topPriorities.map((task, index) => (
              <div
                key={task.id}
                className="flex items-center gap-3 py-2 px-3 rounded-lg hover-elevate"
                data-testid={`priority-item-${task.id}`}
              >
                <span className="text-lg font-bold text-muted-foreground w-6">
                  {index + 1}
                </span>
                <Checkbox
                  checked={task.isCompleted}
                  onCheckedChange={() => onToggleTask(task.id)}
                  className="w-5 h-5"
                  data-testid={`checkbox-priority-${task.id}`}
                />
                <span
                  className={`flex-1 ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}
                >
                  {task.title}
                </span>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getCategoryColor(task.category) }}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
