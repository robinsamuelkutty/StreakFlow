import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { insertTaskSchema, insertTimeBlockSchema } from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

async function calculateConsistencyScore(
  userId: string,
  date: string
): Promise<{ score: number; tasksCompleted: number; tasksTotal: number; blocksCompleted: number; blocksTotal: number }> {
  const tasks = await storage.getTasksByUserAndDate(userId, date);
  const blocks = await storage.getTimeBlocksByUserAndDate(userId, date);
  
  const tasksTotal = tasks.length;
  const tasksCompleted = tasks.filter((t) => t.isCompleted).length;
  const blocksTotal = blocks.length;
  const blocksCompleted = blocks.filter((b) => b.isCompleted).length;
  
  if (tasksTotal === 0 && blocksTotal === 0) {
    return { score: 0, tasksCompleted: 0, tasksTotal: 0, blocksCompleted: 0, blocksTotal: 0 };
  }
  
  const taskWeight = 0.5;
  const blockWeight = 0.5;
  
  const taskScore = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;
  const blockScore = blocksTotal > 0 ? (blocksCompleted / blocksTotal) * 100 : 0;
  
  let baseScore: number;
  if (tasksTotal > 0 && blocksTotal > 0) {
    baseScore = taskScore * taskWeight + blockScore * blockWeight;
  } else if (tasksTotal > 0) {
    baseScore = taskScore;
  } else {
    baseScore = blockScore;
  }
  
  const logs = await storage.getDailyLogsByUser(userId);
  let streakDays = 0;
  const sortedLogs = logs.sort((a, b) => b.date.localeCompare(a.date));
  
  for (const log of sortedLogs) {
    if (log.consistencyScore > 0) {
      streakDays++;
    } else {
      break;
    }
  }
  
  const streakMultiplier = 1 + Math.min(streakDays * 0.02, 0.2);
  const finalScore = Math.round(Math.min(baseScore * streakMultiplier, 100));
  
  return { score: finalScore, tasksCompleted, tasksTotal, blocksCompleted, blocksTotal };
}

async function updateDailyLog(userId: string, date: string): Promise<void> {
  const result = await calculateConsistencyScore(userId, date);
  
  await storage.upsertDailyLog({
    userId,
    date,
    consistencyScore: result.score,
    tasksCompleted: result.tasksCompleted,
    tasksTotal: result.tasksTotal,
    blocksCompleted: result.blocksCompleted,
    blocksTotal: result.blocksTotal,
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "consistency-tracker-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 604800000,
        sameSite: "lax",
      },
    })
  );

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ email, password: hashedPassword });
      
      req.session.userId = user.id;
      
      res.json({ user: { id: user.id, email: user.email } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      req.session.userId = user.id;
      
      res.json({ user: { id: user.id, email: user.email } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    res.json({ user: { id: user.id, email: user.email } });
  });

  app.get("/api/tasks", requireAuth, async (req, res) => {
    try {
      const date = req.query.date as string || new Date().toISOString().split("T")[0];
      const tasks = await storage.getTasksByUserAndDate(req.session.userId!, date);
      res.json(tasks);
    } catch (error) {
      console.error("Failed to get tasks:", error);
      res.status(500).json({ message: "Failed to get tasks" });
    }
  });

  app.post("/api/tasks", requireAuth, async (req, res) => {
    try {
      const schema = insertTaskSchema.omit({ userId: true });
      const validatedData = schema.parse(req.body);
      
      const task = await storage.createTask({
        ...validatedData,
        userId: req.session.userId!,
      });
      
      await updateDailyLog(req.session.userId!, task.date);
      
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      console.error("Failed to create task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id/toggle", requireAuth, async (req, res) => {
    try {
      const taskId = req.params.id;
      const tasks = await storage.getTasksByUserAndDate(req.session.userId!, new Date().toISOString().split("T")[0]);
      const task = tasks.find((t) => t.id === taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const updatedTask = await storage.updateTask(taskId, {
        isCompleted: !task.isCompleted,
      });
      
      if (updatedTask) {
        await updateDailyLog(req.session.userId!, updatedTask.date);
      }
      
      res.json(updatedTask);
    } catch (error) {
      console.error("Failed to toggle task:", error);
      res.status(500).json({ message: "Failed to toggle task" });
    }
  });

  app.patch("/api/tasks/:id/priority", requireAuth, async (req, res) => {
    try {
      const taskId = req.params.id;
      const { priority } = req.body;
      
      const updatedTask = await storage.updateTask(taskId, { priority });
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      console.error("Failed to update task priority:", error);
      res.status(500).json({ message: "Failed to update task priority" });
    }
  });

  app.delete("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteTask(req.params.id);
      res.json({ message: "Task deleted" });
    } catch (error) {
      console.error("Failed to delete task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  app.get("/api/time-blocks", requireAuth, async (req, res) => {
    try {
      const date = req.query.date as string || new Date().toISOString().split("T")[0];
      const blocks = await storage.getTimeBlocksByUserAndDate(req.session.userId!, date);
      res.json(blocks);
    } catch (error) {
      console.error("Failed to get time blocks:", error);
      res.status(500).json({ message: "Failed to get time blocks" });
    }
  });

  app.post("/api/time-blocks", requireAuth, async (req, res) => {
    try {
      const schema = insertTimeBlockSchema.omit({ userId: true });
      const validatedData = schema.parse(req.body);
      
      const block = await storage.createTimeBlock({
        ...validatedData,
        userId: req.session.userId!,
      });
      
      await updateDailyLog(req.session.userId!, block.date);
      
      res.json(block);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid time block data", errors: error.errors });
      }
      console.error("Failed to create time block:", error);
      res.status(500).json({ message: "Failed to create time block" });
    }
  });

  app.patch("/api/time-blocks/:id/toggle", requireAuth, async (req, res) => {
    try {
      const blockId = req.params.id;
      const blocks = await storage.getTimeBlocksByUserAndDate(
        req.session.userId!,
        new Date().toISOString().split("T")[0]
      );
      const block = blocks.find((b) => b.id === blockId);
      
      if (!block) {
        return res.status(404).json({ message: "Time block not found" });
      }
      
      const updatedBlock = await storage.updateTimeBlock(blockId, {
        isCompleted: !block.isCompleted,
      });
      
      if (updatedBlock) {
        await updateDailyLog(req.session.userId!, updatedBlock.date);
      }
      
      res.json(updatedBlock);
    } catch (error) {
      console.error("Failed to toggle time block:", error);
      res.status(500).json({ message: "Failed to toggle time block" });
    }
  });

  app.delete("/api/time-blocks/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteTimeBlock(req.params.id);
      res.json({ message: "Time block deleted" });
    } catch (error) {
      console.error("Failed to delete time block:", error);
      res.status(500).json({ message: "Failed to delete time block" });
    }
  });

  app.get("/api/daily-logs", requireAuth, async (req, res) => {
    try {
      const logs = await storage.getDailyLogsByUser(req.session.userId!);
      res.json(logs);
    } catch (error) {
      console.error("Failed to get daily logs:", error);
      res.status(500).json({ message: "Failed to get daily logs" });
    }
  });

  return httpServer;
}
