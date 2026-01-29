import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { db } from "./db";
import { users, cloudSync } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateToken, authMiddleware, type AuthenticatedRequest } from "./middleware/auth";
import { authRateLimiter, syncRateLimiter, apiRateLimiter } from "./middleware/rateLimit";
import { 
  validate, 
  registerSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema, 
  deleteAccountSchema,
  cloudSyncSaveSchema 
} from "./middleware/validation";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/health", (_req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      version: "2.0.0"
    });
  });

  app.post("/api/auth/register", authRateLimiter, validate(registerSchema), async (req, res) => {
    try {
      const { email, password, name } = req.body;

      const existingUser = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
      if (existingUser.length > 0) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const [newUser] = await db.insert(users).values({
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || null,
      }).returning();

      const token = generateToken({ userId: newUser.id, email: newUser.email });

      res.json({
        success: true,
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to register" });
    }
  });

  app.post("/api/auth/login", authRateLimiter, validate(loginSchema), async (req, res) => {
    try {
      const { email, password } = req.body;

      const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);

      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = generateToken({ userId: user.id, email: user.email });

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/auth/forgot-password", authRateLimiter, validate(forgotPasswordSchema), async (req, res) => {
    try {
      const { email } = req.body;

      const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);

      if (!user) {
        return res.json({ success: true, message: "If the email exists, a reset code has been sent" });
      }

      const resetToken = crypto.randomBytes(3).toString("hex").toUpperCase();
      const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

      await db.update(users)
        .set({ resetToken, resetTokenExpiry })
        .where(eq(users.id, user.id));

      console.log(`Password reset code for ${email}: ${resetToken}`);

      res.json({
        success: true,
        message: "If the email exists, a reset code has been sent",
        resetCode: resetToken,
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  app.post("/api/auth/reset-password", authRateLimiter, validate(resetPasswordSchema), async (req, res) => {
    try {
      const { email, resetCode, newPassword } = req.body;

      const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);

      if (!user || !user.resetToken || !user.resetTokenExpiry) {
        return res.status(400).json({ error: "Invalid or expired reset code" });
      }

      if (user.resetToken !== resetCode.toUpperCase()) {
        return res.status(400).json({ error: "Invalid reset code" });
      }

      if (new Date() > user.resetTokenExpiry) {
        return res.status(400).json({ error: "Reset code has expired" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await db.update(users)
        .set({
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        })
        .where(eq(users.id, user.id));

      res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  app.post("/api/auth/refresh", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const token = generateToken({ userId: user.userId, email: user.email });
      res.json({ success: true, token });
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(500).json({ error: "Failed to refresh token" });
    }
  });

  app.delete("/api/auth/delete-account", authRateLimiter, validate(deleteAccountSchema), async (req, res) => {
    try {
      const { userId, email, password } = req.body;

      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.email.toLowerCase() !== email.toLowerCase()) {
        return res.status(400).json({ error: "Email does not match" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Incorrect password" });
      }

      await db.delete(cloudSync).where(eq(cloudSync.userId, userId));
      await db.delete(users).where(eq(users.id, userId));

      res.json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
      console.error("Delete account error:", error);
      res.status(500).json({ error: "Failed to delete account" });
    }
  });

  app.post("/api/cloud-sync/save", syncRateLimiter, validate(cloudSyncSaveSchema), async (req, res) => {
    try {
      const { userId, email, data } = req.body;

      await db.insert(cloudSync)
        .values({
          userId,
          email: email || null,
          data,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: cloudSync.userId,
          set: {
            data,
            email: email || null,
            updatedAt: new Date(),
          },
        });

      res.json({ success: true, message: "Data saved to cloud" });
    } catch (error) {
      console.error("Error saving to cloud:", error);
      res.status(500).json({ error: "Failed to save data" });
    }
  });

  app.get("/api/cloud-sync/load/:userId", syncRateLimiter, async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
      }

      const result = await db.select().from(cloudSync).where(eq(cloudSync.userId, userId)).limit(1);

      if (result.length === 0) {
        return res.status(404).json({ error: "No cloud data found" });
      }

      res.json({ success: true, data: result[0].data, updatedAt: result[0].updatedAt });
    } catch (error) {
      console.error("Error loading from cloud:", error);
      res.status(500).json({ error: "Failed to load data" });
    }
  });

  app.use("/api", apiRateLimiter);

  const httpServer = createServer(app);

  return httpServer;
}
