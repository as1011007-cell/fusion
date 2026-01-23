import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { db } from "./db";
import { cloudSync } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Cloud sync endpoints
  app.post("/api/cloud-sync/save", async (req, res) => {
    try {
      const { socialId, provider, email, data } = req.body;
      
      if (!socialId || !data) {
        return res.status(400).json({ error: "Missing socialId or data" });
      }

      await db.insert(cloudSync)
        .values({
          socialId,
          provider: provider || "google",
          email: email || null,
          data,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: cloudSync.socialId,
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

  app.get("/api/cloud-sync/load/:socialId", async (req, res) => {
    try {
      const { socialId } = req.params;
      
      if (!socialId) {
        return res.status(400).json({ error: "Missing socialId" });
      }

      const result = await db.select().from(cloudSync).where(eq(cloudSync.socialId, socialId)).limit(1);
      
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
