import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, date, integer, timestamp, time } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  timeBlocks: many(timeBlocks),
  dailyLogs: many(dailyLogs),
}));

export const tasks = pgTable("tasks", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  date: date("date").notNull(),
  category: text("category").notNull().default("general"),
  priority: integer("priority").default(0).notNull(),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export const timeBlocks = pgTable("time_blocks", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  label: text("label").notNull(),
  category: text("category").notNull().default("work"),
  color: text("color").notNull().default("#3b82f6"),
  isCompleted: boolean("is_completed").default(false).notNull(),
});

export const timeBlocksRelations = relations(timeBlocks, ({ one }) => ({
  user: one(users, {
    fields: [timeBlocks.userId],
    references: [users.id],
  }),
}));

export const dailyLogs = pgTable("daily_logs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  consistencyScore: integer("consistency_score").default(0).notNull(),
  notes: text("notes"),
  tasksCompleted: integer("tasks_completed").default(0).notNull(),
  tasksTotal: integer("tasks_total").default(0).notNull(),
  blocksCompleted: integer("blocks_completed").default(0).notNull(),
  blocksTotal: integer("blocks_total").default(0).notNull(),
});

export const dailyLogsRelations = relations(dailyLogs, ({ one }) => ({
  user: one(users, {
    fields: [dailyLogs.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
});

export const insertTimeBlockSchema = createInsertSchema(timeBlocks).omit({
  id: true,
});

export const insertDailyLogSchema = createInsertSchema(dailyLogs).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTimeBlock = z.infer<typeof insertTimeBlockSchema>;
export type TimeBlock = typeof timeBlocks.$inferSelect;
export type InsertDailyLog = z.infer<typeof insertDailyLogSchema>;
export type DailyLog = typeof dailyLogs.$inferSelect;

export const categories = [
  { value: "work", label: "Work", color: "#3b82f6" },
  { value: "health", label: "Health", color: "#22c55e" },
  { value: "learning", label: "Learning", color: "#a855f7" },
  { value: "personal", label: "Personal", color: "#f97316" },
  { value: "general", label: "General", color: "#6b7280" },
] as const;

export type Category = typeof categories[number]["value"];
