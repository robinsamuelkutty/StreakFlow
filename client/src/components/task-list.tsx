import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ListTodo, Star, StarOff } from "lucide-react";
import type { Task } from "@shared/schema";
import { categories, type Category } from "@shared/schema";

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string, category: Category, priority: number) => void;
  onTogglePriority: (taskId: string, priority: number) => void;
  isLoading?: boolean;
}

export function TaskList({ tasks, onToggleTask, onAddTask, onTogglePriority, isLoading }: TaskListProps) {
  const [newTask, setNewTask] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("general");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTask = () => {
    if (newTask.trim()) {
      onAddTask(newTask.trim(), newCategory, 0);
      setNewTask("");
      setIsAdding(false);
    }
  };

  const completedCount = tasks.filter((t) => t.isCompleted).length;

  return (
    <Card data-testid="card-task-list">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <ListTodo className="w-5 h-5" />
          Today's Tasks
          <span className="text-sm font-normal text-muted-foreground">
            ({completedCount}/{tasks.length})
          </span>
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsAdding(!isAdding)}
          data-testid="button-add-task"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {isAdding && (
          <div className="flex gap-2 flex-wrap">
            <Input
              placeholder="Add a task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              className="flex-1 min-w-[200px] h-9"
              autoFocus
              data-testid="input-new-task"
            />
            <Select value={newCategory} onValueChange={(v) => setNewCategory(v as Category)}>
              <SelectTrigger className="w-32 h-9" data-testid="select-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleAddTask} data-testid="button-save-task">
              Add
            </Button>
          </div>
        )}
        
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-5 h-5 rounded bg-muted animate-pulse" />
                <div className="flex-1 h-4 rounded bg-muted animate-pulse" />
                <div className="w-16 h-5 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ListTodo className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">No tasks for today</p>
            <p className="text-xs mt-1">Add your first task to get started</p>
          </div>
        ) : (
          <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
            {tasks
              .sort((a, b) => {
                if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
                return b.priority - a.priority;
              })
              .map((task) => {
                const category = categories.find((c) => c.value === task.category);
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover-elevate group"
                    data-testid={`task-item-${task.id}`}
                  >
                    <Checkbox
                      checked={task.isCompleted}
                      onCheckedChange={() => onToggleTask(task.id)}
                      className="w-5 h-5"
                      data-testid={`checkbox-task-${task.id}`}
                    />
                    <span
                      className={`flex-1 text-sm ${
                        task.isCompleted ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {task.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onTogglePriority(task.id, task.priority > 0 ? 0 : 1)}
                      data-testid={`button-toggle-priority-${task.id}`}
                    >
                      {task.priority > 0 ? (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <StarOff className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{
                        backgroundColor: `${category?.color}20`,
                        color: category?.color,
                      }}
                    >
                      {category?.label || "General"}
                    </Badge>
                  </div>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
