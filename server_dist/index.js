// server/index.ts
import express from "express";

// server/routes.ts
import { createServer } from "node:http";

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
var { Pool } = pg;
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
var db = drizzle(pool);

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  name: true
});
var cloudSync = pgTable("cloud_sync", {
  userId: varchar("user_id").primaryKey(),
  email: text("email"),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// server/routes.ts
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// server/middleware/auth.ts
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET || "feud-fusion-secret-key-change-in-production";
var JWT_EXPIRES_IN = "7d";
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization token required" });
  }
  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  req.user = payload;
  next();
}

// server/middleware/rateLimit.ts
import rateLimit from "express-rate-limit";
var authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 10,
  message: { error: "Too many attempts, please try again in 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false
});
var apiRateLimiter = rateLimit({
  windowMs: 60 * 1e3,
  max: 100,
  message: { error: "Too many requests, please slow down" },
  standardHeaders: true,
  legacyHeaders: false
});
var syncRateLimiter = rateLimit({
  windowMs: 60 * 1e3,
  max: 30,
  message: { error: "Too many sync requests, please wait" },
  standardHeaders: true,
  legacyHeaders: false
});

// server/middleware/validation.ts
import { z } from "zod";
var registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional()
});
var loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});
var forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format")
});
var resetPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
  resetCode: z.string().min(1, "Reset code is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters")
});
var deleteAccountSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});
var cloudSyncSaveSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  email: z.string().email().optional(),
  data: z.any()
});
var checkoutSchema = z.object({
  priceId: z.string().min(1, "Price ID is required"),
  successUrl: z.string().url("Invalid success URL"),
  cancelUrl: z.string().url("Invalid cancel URL")
});
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message);
      return res.status(400).json({
        error: errors[0],
        details: errors
      });
    }
    req.body = result.data;
    next();
  };
}

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/health", (_req, res) => {
    res.json({
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      version: "2.0.0"
    });
  });
  app2.post("/api/auth/register", authRateLimiter, validate(registerSchema), async (req, res) => {
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
        name: name || null
      }).returning();
      const token = generateToken({ userId: newUser.id, email: newUser.email });
      res.json({
        success: true,
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to register" });
    }
  });
  app2.post("/api/auth/login", authRateLimiter, validate(loginSchema), async (req, res) => {
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
          name: user.name
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });
  app2.post("/api/auth/forgot-password", authRateLimiter, validate(forgotPasswordSchema), async (req, res) => {
    try {
      const { email } = req.body;
      const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
      if (!user) {
        return res.json({ success: true, message: "If the email exists, a reset code has been sent" });
      }
      const resetToken = crypto.randomBytes(3).toString("hex").toUpperCase();
      const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1e3);
      await db.update(users).set({ resetToken, resetTokenExpiry }).where(eq(users.id, user.id));
      console.log(`Password reset code for ${email}: ${resetToken}`);
      res.json({
        success: true,
        message: "If the email exists, a reset code has been sent",
        resetCode: resetToken
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });
  app2.post("/api/auth/reset-password", authRateLimiter, validate(resetPasswordSchema), async (req, res) => {
    try {
      const { email, resetCode, newPassword } = req.body;
      const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
      if (!user || !user.resetToken || !user.resetTokenExpiry) {
        return res.status(400).json({ error: "Invalid or expired reset code" });
      }
      if (user.resetToken !== resetCode.toUpperCase()) {
        return res.status(400).json({ error: "Invalid reset code" });
      }
      if (/* @__PURE__ */ new Date() > user.resetTokenExpiry) {
        return res.status(400).json({ error: "Reset code has expired" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await db.update(users).set({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }).where(eq(users.id, user.id));
      res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });
  app2.post("/api/auth/refresh", authMiddleware, async (req, res) => {
    try {
      const user = req.user;
      const token = generateToken({ userId: user.userId, email: user.email });
      res.json({ success: true, token });
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(500).json({ error: "Failed to refresh token" });
    }
  });
  app2.delete("/api/auth/delete-account", authRateLimiter, validate(deleteAccountSchema), async (req, res) => {
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
  app2.post("/api/cloud-sync/save", syncRateLimiter, validate(cloudSyncSaveSchema), async (req, res) => {
    try {
      const { userId, email, data } = req.body;
      await db.insert(cloudSync).values({
        userId,
        email: email || null,
        data,
        updatedAt: /* @__PURE__ */ new Date()
      }).onConflictDoUpdate({
        target: cloudSync.userId,
        set: {
          data,
          email: email || null,
          updatedAt: /* @__PURE__ */ new Date()
        }
      });
      res.json({ success: true, message: "Data saved to cloud" });
    } catch (error) {
      console.error("Error saving to cloud:", error);
      res.status(500).json({ error: "Failed to save data" });
    }
  });
  app2.get("/api/cloud-sync/load/:userId", syncRateLimiter, async (req, res) => {
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
  app2.use("/api", apiRateLimiter);
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
import * as fs from "fs";
import * as path from "path";

// server/multiplayer.ts
import { WebSocketServer, WebSocket } from "ws";
var rooms = /* @__PURE__ */ new Map();
var playerRooms = /* @__PURE__ */ new Map();
function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
function generatePlayerId() {
  return "player_" + Math.random().toString(36).substring(2, 11);
}
function broadcastToRoom(room, message, excludePlayerId) {
  room.players.forEach((player, playerId) => {
    if (playerId !== excludePlayerId && player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(JSON.stringify(message));
    }
  });
}
function getRoomState(room) {
  return {
    id: room.id,
    code: room.code,
    hostId: room.hostId,
    status: room.status,
    currentQuestion: room.currentQuestion,
    currentPanel: room.currentPanel,
    selectedPanelId: room.selectedPanelId,
    selectedPanelName: room.selectedPanelName,
    maxPlayers: room.maxPlayers,
    iqSettings: room.iqSettings,
    players: Array.from(room.players.values()).map((p) => ({
      id: p.id,
      name: p.name,
      avatarId: p.avatarId,
      score: p.score,
      ready: p.ready
    }))
  };
}
function setupMultiplayer(server) {
  const wss = new WebSocketServer({ server, path: "/ws/multiplayer" });
  console.log("WebSocket server initialized for multiplayer");
  const pingInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    });
  }, 25e3);
  wss.on("close", () => {
    clearInterval(pingInterval);
  });
  wss.on("connection", (ws) => {
    let playerId = null;
    let currentRoomCode = null;
    let isAlive = true;
    ws.on("pong", () => {
      isAlive = true;
    });
    ws.ping();
    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        switch (message.type) {
          case "CREATE_ROOM": {
            playerId = generatePlayerId();
            const roomCode = generateRoomCode();
            const roomId = "room_" + Date.now();
            const room = {
              id: roomId,
              code: roomCode,
              hostId: playerId,
              players: /* @__PURE__ */ new Map(),
              status: "waiting",
              currentQuestion: 0,
              questions: [],
              currentPanel: "",
              selectedPanelId: "mixed",
              selectedPanelName: "Mixed",
              roundAnswers: /* @__PURE__ */ new Map(),
              maxPlayers: message.maxPlayers || 8,
              createdAt: /* @__PURE__ */ new Date(),
              chatMessages: [],
              iqSettings: message.iqSettings || void 0
            };
            const player = {
              id: playerId,
              name: message.playerName || "Player",
              avatarId: message.avatarId || "avatar-1",
              score: 0,
              ws,
              ready: true
            };
            room.players.set(playerId, player);
            rooms.set(roomCode, room);
            playerRooms.set(playerId, roomCode);
            currentRoomCode = roomCode;
            ws.send(JSON.stringify({
              type: "ROOM_CREATED",
              playerId,
              room: getRoomState(room)
            }));
            break;
          }
          case "JOIN_ROOM": {
            const roomCode = message.roomCode?.toUpperCase();
            const room = rooms.get(roomCode);
            if (!room) {
              ws.send(JSON.stringify({ type: "ERROR", message: "Room not found" }));
              return;
            }
            if (room.status !== "waiting") {
              ws.send(JSON.stringify({ type: "ERROR", message: "Game already in progress" }));
              return;
            }
            if (room.players.size >= room.maxPlayers) {
              ws.send(JSON.stringify({ type: "ERROR", message: "Room is full" }));
              return;
            }
            playerId = generatePlayerId();
            const player = {
              id: playerId,
              name: message.playerName || "Player",
              avatarId: message.avatarId || "avatar-1",
              score: 0,
              ws,
              ready: false
            };
            room.players.set(playerId, player);
            playerRooms.set(playerId, roomCode);
            currentRoomCode = roomCode;
            ws.send(JSON.stringify({
              type: "ROOM_JOINED",
              playerId,
              room: getRoomState(room)
            }));
            broadcastToRoom(room, {
              type: "PLAYER_JOINED",
              player: { id: playerId, name: player.name, avatarId: player.avatarId, score: 0, ready: false },
              room: getRoomState(room)
            }, playerId);
            break;
          }
          case "PLAYER_READY": {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room) return;
            const player = room.players.get(playerId);
            if (player) {
              player.ready = message.ready;
              broadcastToRoom(room, {
                type: "PLAYER_READY_UPDATE",
                playerId,
                ready: message.ready,
                room: getRoomState(room)
              });
            }
            break;
          }
          case "SELECT_PANEL": {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.hostId !== playerId) return;
            room.selectedPanelId = message.panelId || "mixed";
            room.selectedPanelName = message.panelName || "Mixed";
            broadcastToRoom(room, {
              type: "PANEL_SELECTED",
              panelId: room.selectedPanelId,
              panelName: room.selectedPanelName,
              room: getRoomState(room)
            });
            break;
          }
          case "START_GAME": {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.hostId !== playerId) return;
            const allReady = Array.from(room.players.values()).every((p) => p.ready);
            if (!allReady || room.players.size < 2) {
              ws.send(JSON.stringify({ type: "ERROR", message: "All players must be ready" }));
              return;
            }
            room.status = "playing";
            room.questions = message.questions || [];
            room.currentPanel = message.panel || "Gen Z";
            room.currentQuestion = 0;
            broadcastToRoom(room, {
              type: "GAME_STARTED",
              room: getRoomState(room),
              question: room.questions[0],
              panel: room.currentPanel
            });
            break;
          }
          case "SUBMIT_ANSWER": {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.status !== "playing") return;
            room.roundAnswers.set(playerId, {
              answer: message.answer,
              timestamp: Date.now()
            });
            broadcastToRoom(room, {
              type: "PLAYER_ANSWERED",
              playerId,
              answeredCount: room.roundAnswers.size,
              totalPlayers: room.players.size
            });
            if (room.roundAnswers.size === room.players.size) {
              const results = Array.from(room.roundAnswers.entries()).map(([pid, ans]) => {
                const player = room.players.get(pid);
                const isCorrect = ans.answer === message.correctAnswer;
                if (isCorrect && player) {
                  player.score += message.points || 100;
                }
                return {
                  playerId: pid,
                  playerName: player?.name,
                  answer: ans.answer,
                  isCorrect,
                  newScore: player?.score || 0
                };
              });
              broadcastToRoom(room, {
                type: "ROUND_RESULTS",
                results,
                correctAnswer: message.correctAnswer,
                room: getRoomState(room)
              });
              room.roundAnswers.clear();
            }
            break;
          }
          case "NEXT_QUESTION": {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.status !== "playing") return;
            const nextQuestionIndex = room.currentQuestion + 1;
            if (nextQuestionIndex >= room.questions.length) {
              room.status = "finished";
              room.currentQuestion = nextQuestionIndex;
              const finalScores = Array.from(room.players.values()).map((p) => ({ id: p.id, name: p.name, score: p.score, avatarId: p.avatarId })).sort((a, b) => b.score - a.score);
              console.log("Game finished! Final scores:", finalScores);
              const topScore = finalScores[0]?.score || 0;
              const playersWithTopScore = finalScores.filter((p) => p.score === topScore);
              const isDraw = playersWithTopScore.length > 1;
              broadcastToRoom(room, {
                type: "GAME_FINISHED",
                finalScores,
                winner: isDraw ? null : finalScores[0],
                isDraw,
                room: getRoomState(room)
              });
            } else {
              room.currentQuestion = nextQuestionIndex;
              room.roundAnswers.clear();
              broadcastToRoom(room, {
                type: "NEW_QUESTION",
                questionIndex: room.currentQuestion,
                question: room.questions[room.currentQuestion]
              });
            }
            break;
          }
          case "LEAVE_ROOM": {
            if (!currentRoomCode || !playerId) return;
            handlePlayerLeave(playerId, currentRoomCode);
            currentRoomCode = null;
            playerId = null;
            break;
          }
          case "PLAY_AGAIN": {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room) return;
            if (room.hostId !== playerId && room.players.size > 1) {
              ws.send(JSON.stringify({ type: "ERROR", message: "Only host can start new game" }));
              return;
            }
            room.status = "waiting";
            room.currentQuestion = 0;
            room.questions = [];
            room.roundAnswers.clear();
            room.chatMessages = [];
            room.players.forEach((player, pid) => {
              player.score = 0;
              player.ready = pid === room.hostId;
            });
            broadcastToRoom(room, {
              type: "ROOM_RESET",
              room: getRoomState(room)
            });
            ws.send(JSON.stringify({
              type: "ROOM_RESET",
              room: getRoomState(room)
            }));
            break;
          }
          case "CHAT_MESSAGE": {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.status !== "waiting") return;
            const player = room.players.get(playerId);
            if (!player) return;
            const chatMsg = {
              id: "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
              playerId,
              playerName: player.name,
              message: message.message?.slice(0, 200) || "",
              timestamp: Date.now()
            };
            room.chatMessages.push(chatMsg);
            if (room.chatMessages.length > 50) {
              room.chatMessages = room.chatMessages.slice(-50);
            }
            broadcastToRoom(room, {
              type: "CHAT_MESSAGE",
              message: chatMsg
            });
            break;
          }
          case "UPDATE_IQ_SETTINGS": {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room || room.hostId !== playerId || room.status !== "waiting") return;
            room.iqSettings = {
              difficulty: message.difficulty || "all",
              category: message.category || "all",
              questionCount: Math.min(Math.max(message.questionCount || 10, 5), 30)
            };
            broadcastToRoom(room, {
              type: "IQ_SETTINGS_UPDATED",
              iqSettings: room.iqSettings,
              room: getRoomState(room)
            });
            break;
          }
          case "SET_IQ_SETTINGS": {
            if (!currentRoomCode || !playerId) return;
            const room = rooms.get(currentRoomCode);
            if (!room) return;
            if (room.hostId === playerId) {
              room.iqSettings = {
                difficulty: message.difficulty || "all",
                category: message.category || "all",
                questionCount: Math.min(Math.max(message.questionCount || 10, 5), 30)
              };
            }
            break;
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    ws.on("close", () => {
      if (playerId && currentRoomCode) {
        handlePlayerLeave(playerId, currentRoomCode);
      }
    });
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });
  function handlePlayerLeave(playerId, roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return;
    room.roundAnswers.delete(playerId);
    room.players.delete(playerId);
    playerRooms.delete(playerId);
    if (room.players.size === 0) {
      rooms.delete(roomCode);
      return;
    }
    if (room.hostId === playerId) {
      const newHost = room.players.keys().next().value;
      if (newHost) {
        room.hostId = newHost;
        const newHostPlayer = room.players.get(newHost);
        if (newHostPlayer && room.status === "waiting") {
          newHostPlayer.ready = true;
        }
      }
    }
    if (room.status === "playing" && room.roundAnswers.size > 0 && room.roundAnswers.size === room.players.size) {
      console.log("All remaining players answered after player left");
    }
    broadcastToRoom(room, {
      type: "PLAYER_LEFT",
      playerId,
      newHostId: room.hostId,
      room: getRoomState(room)
    });
  }
  setInterval(() => {
    const now = Date.now();
    rooms.forEach((room, code) => {
      if (now - room.createdAt.getTime() > 2 * 60 * 60 * 1e3) {
        room.players.forEach((player) => {
          player.ws.send(JSON.stringify({ type: "ROOM_EXPIRED" }));
          player.ws.close();
        });
        rooms.delete(code);
      }
    });
  }, 6e4);
}

// server/index.ts
var app = express();
var log = console.log;
function setupCors(app2) {
  app2.use((req, res, next) => {
    const origins = /* @__PURE__ */ new Set();
    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }
    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        origins.add(`https://${d.trim()}`);
      });
    }
    const origin = req.header("origin");
    const isLocalhost = origin?.startsWith("http://localhost:") || origin?.startsWith("http://127.0.0.1:");
    if (origin && (origins.has(origin) || isLocalhost)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header("Access-Control-Allow-Headers", "Content-Type");
      res.header("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
}
function setupBodyParsing(app2) {
  app2.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app2.use(express.urlencoded({ extended: false }));
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    const start = Date.now();
    const path2 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path2.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    });
    next();
  });
}
function getAppName() {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}
function serveExpoManifest(platform, res) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json"
  );
  if (!fs.existsSync(manifestPath)) {
    return res.status(404).json({ error: `Manifest not found for platform: ${platform}` });
  }
  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");
  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}
function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;
  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);
  const html = landingPageTemplate.replace(/BASE_URL_PLACEHOLDER/g, baseUrl).replace(/EXPS_URL_PLACEHOLDER/g, expsUrl).replace(/APP_NAME_PLACEHOLDER/g, appName);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
function configureExpoAndLanding(app2) {
  const templatePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html"
  );
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
  const appName = getAppName();
  log("Serving static Expo files with dynamic manifest routing");
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }
    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }
    if (req.path === "/") {
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName
      });
    }
    next();
  });
  app2.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app2.use(express.static(path.resolve(process.cwd(), "static-build")));
  app2.get("/google5558d3209820d790.html", (_req, res) => {
    res.type("text/html").send("google-site-verification: google5558d3209820d790.html");
  });
  log("Expo routing: Checking expo-platform header on / and /manifest");
}
function setupErrorHandler(app2) {
  app2.use((err, _req, res, next) => {
    const error = err;
    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });
}
(async () => {
  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);
  app.get("/privacy", (_req, res) => {
    const privacyPath = path.resolve(
      process.cwd(),
      "server",
      "templates",
      "privacy-policy.html"
    );
    res.sendFile(privacyPath);
  });
  app.get("/support", (_req, res) => {
    const supportPath = path.resolve(process.cwd(), "server", "templates", "support.html");
    res.sendFile(supportPath);
  });
  app.get("/auth/callback", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Logging in...</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, sans-serif; background: #1a1a2e; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; text-align: center; }
            .container { padding: 40px; }
            h1 { color: #00ff88; font-size: 24px; }
            p { color: #ccc; font-size: 16px; margin-top: 10px; }
            .spinner { width: 40px; height: 40px; border: 4px solid #333; border-top-color: #00ff88; border-radius: 50%; animation: spin 1s linear infinite; margin: 20px auto; }
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="spinner"></div>
            <h1>Logging you in...</h1>
            <p>Please wait while we complete your login.</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'oauth', url: window.location.href }, '*');
              setTimeout(() => window.close(), 1000);
            } else {
              document.querySelector('h1').textContent = 'Login Complete!';
              document.querySelector('p').textContent = 'You can close this window and return to the app.';
              document.querySelector('.spinner').style.display = 'none';
            }
          </script>
        </body>
      </html>
    `);
  });
  configureExpoAndLanding(app);
  const server = await registerRoutes(app);
  setupMultiplayer(server);
  setupErrorHandler(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log(`express server serving on port ${port}`);
    }
  );
})();
