import { 
  users, tasks, timeBlocks, dailyLogs,
  type User, type InsertUser, 
  type Task, type InsertTask,
  type TimeBlock, type InsertTimeBlock,
  type DailyLog, type InsertDailyLog
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getTasksByUserAndDate(userId: string, date: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<void>;
  
  getTimeBlocksByUserAndDate(userId: string, date: string): Promise<TimeBlock[]>;
  createTimeBlock(block: InsertTimeBlock): Promise<TimeBlock>;
  updateTimeBlock(id: string, updates: Partial<TimeBlock>): Promise<TimeBlock | undefined>;
  deleteTimeBlock(id: string): Promise<void>;
  
  getDailyLogsByUser(userId: string): Promise<DailyLog[]>;
  getDailyLogByUserAndDate(userId: string, date: string): Promise<DailyLog | undefined>;
  upsertDailyLog(log: InsertDailyLog): Promise<DailyLog>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getTasksByUserAndDate(userId: string, date: string): Promise<Task[]> {
    return db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.date, date)));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getTimeBlocksByUserAndDate(userId: string, date: string): Promise<TimeBlock[]> {
    return db
      .select()
      .from(timeBlocks)
      .where(and(eq(timeBlocks.userId, userId), eq(timeBlocks.date, date)));
  }

  async createTimeBlock(block: InsertTimeBlock): Promise<TimeBlock> {
    const [newBlock] = await db.insert(timeBlocks).values(block).returning();
    return newBlock;
  }

  async updateTimeBlock(id: string, updates: Partial<TimeBlock>): Promise<TimeBlock | undefined> {
    const [updatedBlock] = await db
      .update(timeBlocks)
      .set(updates)
      .where(eq(timeBlocks.id, id))
      .returning();
    return updatedBlock;
  }

  async deleteTimeBlock(id: string): Promise<void> {
    await db.delete(timeBlocks).where(eq(timeBlocks.id, id));
  }

  async getDailyLogsByUser(userId: string): Promise<DailyLog[]> {
    return db
      .select()
      .from(dailyLogs)
      .where(eq(dailyLogs.userId, userId))
      .orderBy(desc(dailyLogs.date));
  }

  async getDailyLogByUserAndDate(userId: string, date: string): Promise<DailyLog | undefined> {
    const [log] = await db
      .select()
      .from(dailyLogs)
      .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, date)));
    return log;
  }

  async upsertDailyLog(log: InsertDailyLog): Promise<DailyLog> {
    const existing = await this.getDailyLogByUserAndDate(log.userId, log.date);
    
    if (existing) {
      const [updated] = await db
        .update(dailyLogs)
        .set(log)
        .where(eq(dailyLogs.id, existing.id))
        .returning();
      return updated;
    }
    
    const [newLog] = await db.insert(dailyLogs).values(log).returning();
    return newLog;
  }
}

export const storage = new DatabaseStorage();
