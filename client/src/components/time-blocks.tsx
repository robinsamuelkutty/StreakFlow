import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Plus, GripVertical } from "lucide-react";
import type { TimeBlock } from "@shared/schema";
import { categories, type Category } from "@shared/schema";

interface TimeBlocksProps {
  blocks: TimeBlock[];
  onAddBlock: (block: { label: string; startTime: string; endTime: string; category: Category }) => void;
  onToggleBlock: (blockId: string) => void;
  isLoading?: boolean;
}

const timeSlots = Array.from({ length: 18 }, (_, i) => {
  const hour = i + 6;
  return {
    value: `${hour.toString().padStart(2, "0")}:00`,
    label: hour <= 12 ? `${hour} AM` : `${hour - 12} PM`,
  };
});

export function TimeBlocks({ blocks, onAddBlock, onToggleBlock, isLoading }: TimeBlocksProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBlock, setNewBlock] = useState({
    label: "",
    startTime: "09:00",
    endTime: "10:00",
    category: "work" as Category,
  });

  const handleAddBlock = () => {
    if (newBlock.label.trim() && newBlock.startTime && newBlock.endTime) {
      onAddBlock({
        label: newBlock.label.trim(),
        startTime: newBlock.startTime,
        endTime: newBlock.endTime,
        category: newBlock.category,
      });
      setNewBlock({
        label: "",
        startTime: "09:00",
        endTime: "10:00",
        category: "work",
      });
      setIsDialogOpen(false);
    }
  };

  const sortedBlocks = useMemo(() => {
    return [...blocks].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [blocks]);

  const getBlockPosition = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const startPos = (startHour - 6) * 64 + (startMin / 60) * 64;
    const height = ((endHour - startHour) * 60 + (endMin - startMin)) / 60 * 64;
    return { top: startPos, height: Math.max(height, 32) };
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find((c) => c.value === category);
    return cat?.color || "#6b7280";
  };

  const completedCount = blocks.filter((b) => b.isCompleted).length;

  return (
    <Card className="md:col-span-2" data-testid="card-time-blocks">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Time Blocks
          <span className="text-sm font-normal text-muted-foreground">
            ({completedCount}/{blocks.length} completed)
          </span>
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-add-block">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Time Block</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  placeholder="What are you working on?"
                  value={newBlock.label}
                  onChange={(e) => setNewBlock({ ...newBlock, label: e.target.value })}
                  data-testid="input-block-label"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Select
                    value={newBlock.startTime}
                    onValueChange={(v) => setNewBlock({ ...newBlock, startTime: v })}
                  >
                    <SelectTrigger data-testid="select-start-time">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Select
                    value={newBlock.endTime}
                    onValueChange={(v) => setNewBlock({ ...newBlock, endTime: v })}
                  >
                    <SelectTrigger data-testid="select-end-time">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newBlock.category}
                  onValueChange={(v) => setNewBlock({ ...newBlock, category: v as Category })}
                >
                  <SelectTrigger data-testid="select-block-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleAddBlock} data-testid="button-save-block">
                Add Block
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading timeline...</div>
          </div>
        ) : (
          <div className="relative h-[576px] overflow-y-auto pr-2">
            <div className="flex">
              <div className="w-16 shrink-0">
                {timeSlots.map((slot) => (
                  <div
                    key={slot.value}
                    className="h-16 text-xs text-muted-foreground flex items-start pt-1"
                  >
                    {slot.label}
                  </div>
                ))}
              </div>
              
              <div className="flex-1 relative border-l border-border">
                {timeSlots.map((slot, i) => (
                  <div
                    key={slot.value}
                    className={`h-16 border-b border-dashed border-border/50 ${
                      i % 2 === 0 ? "bg-muted/20" : ""
                    }`}
                  />
                ))}
                
                {sortedBlocks.map((block) => {
                  const pos = getBlockPosition(block.startTime, block.endTime);
                  const color = getCategoryColor(block.category);
                  return (
                    <div
                      key={block.id}
                      className={`absolute left-2 right-2 rounded-lg p-3 transition-all cursor-pointer group ${
                        block.isCompleted ? "opacity-60" : ""
                      }`}
                      style={{
                        top: pos.top,
                        height: pos.height,
                        backgroundColor: `${color}20`,
                        borderLeft: `4px solid ${color}`,
                      }}
                      onClick={() => onToggleBlock(block.id)}
                      data-testid={`time-block-${block.id}`}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={block.isCompleted}
                              onClick={(e) => e.stopPropagation()}
                              onCheckedChange={() => onToggleBlock(block.id)}
                              className="w-4 h-4"
                            />
                            <span
                              className={`text-sm font-medium truncate ${
                                block.isCompleted ? "line-through text-muted-foreground" : ""
                              }`}
                              style={{ color: block.isCompleted ? undefined : color }}
                            >
                              {block.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {block.startTime} - {block.endTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {sortedBlocks.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No time blocks scheduled</p>
                      <p className="text-xs mt-1">Add blocks to plan your day</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
