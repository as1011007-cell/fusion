import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { db } from "./db";
import { users, cloudSync } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const existingUser = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
      if (existingUser.length > 0) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const [newUser] = await db.insert(users).values({
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || null,
      }).returning();

      res.json({
        success: true,
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

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);

      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      res.json({
        success: true,
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

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

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

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, resetCode, newPassword } = req.body;

      if (!email || !resetCode || !newPassword) {
        return res.status(400).json({ error: "Email, reset code, and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

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

      const hashedPassword = await bcrypt.hash(newPassword, 10);

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

  // Delete account endpoint
  app.delete("/api/auth/delete-account", async (req, res) => {
    try {
      const { userId, email, password } = req.body;

      if (!userId || !email || !password) {
        return res.status(400).json({ error: "User ID, email, and password are required" });
      }

      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify email matches
      if (user.email.toLowerCase() !== email.toLowerCase()) {
        return res.status(400).json({ error: "Email does not match" });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Incorrect password" });
      }

      // Delete cloud sync data first
      await db.delete(cloudSync).where(eq(cloudSync.userId, userId));

      // Delete user account
      await db.delete(users).where(eq(users.id, userId));

      res.json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
      console.error("Delete account error:", error);
      res.status(500).json({ error: "Failed to delete account" });
    }
  });

  app.post("/api/cloud-sync/save", async (req, res) => {
    try {
      const { userId, email, data } = req.body;

      if (!userId || !data) {
        return res.status(400).json({ error: "Missing userId or data" });
      }

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

  app.get("/api/cloud-sync/load/:userId", async (req, res) => {
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

  const httpServer = createServer(app);

  return httpServer;
}
