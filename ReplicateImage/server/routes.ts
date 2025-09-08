import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generationRequestSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { writeFile } from "fs/promises";
import { join } from "path";
import Replicate from "replicate";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY || "default_key"
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get recent generations
  app.get("/api/generations", async (req, res) => {
    try {
      const generations = await storage.getRecentGenerations();
      res.json(generations);
    } catch (error) {
      console.error("Error fetching generations:", error);
      res.status(500).json({ error: "Failed to fetch generations" });
    }
  });

  // Get specific generation
  app.get("/api/generations/:id", async (req, res) => {
    try {
      const generation = await storage.getGeneration(req.params.id);
      if (!generation) {
        return res.status(404).json({ error: "Generation not found" });
      }
      res.json(generation);
    } catch (error) {
      console.error("Error fetching generation:", error);
      res.status(500).json({ error: "Failed to fetch generation" });
    }
  });

  // Upload images endpoint
  app.post("/api/upload", upload.array("images", 5), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const uploadedUrls: string[] = [];
      
      for (const file of req.files) {
        // For demo purposes, we'll create data URLs
        // In production, you'd upload to cloud storage
        const base64 = file.buffer.toString('base64');
        const dataUrl = `data:${file.mimetype};base64,${base64}`;
        uploadedUrls.push(dataUrl);
      }

      res.json({ urls: uploadedUrls });
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ error: "Failed to upload files" });
    }
  });

  // Create new generation
  app.post("/api/generations", async (req, res) => {
    try {
      const validatedData = generationRequestSchema.parse(req.body);
      
      // Create generation record
      const generation = await storage.createGeneration({
        prompt: validatedData.prompt,
        imageUrls: validatedData.imageUrls,
      });

      // Start async generation process
      generateImage(generation.id, validatedData).catch(console.error);

      res.json(generation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Error creating generation:", error);
      res.status(500).json({ error: "Failed to create generation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function generateImage(generationId: string, request: { prompt: string; imageUrls: string[] }) {
  try {
    // Update status to processing
    await storage.updateGeneration(generationId, { 
      status: "processing" 
    });

    const input = {
      prompt: request.prompt,
      image_input: request.imageUrls
    };

    console.log("Starting Replicate generation with input:", input);

    const output = await replicate.run("google/nano-banana", { input });
    
    // Handle the output which might be a URL or file
    let resultUrl: string;
    if (typeof output === 'string') {
      resultUrl = output;
    } else if (output && typeof output === 'object' && 'href' in output) {
      resultUrl = (output as any).href; // URL object has href property
    } else if (output && typeof output === 'object' && 'toString' in output) {
      resultUrl = output.toString(); // Convert to string
    } else if (output && typeof output === 'object' && 'url' in output) {
      resultUrl = (output as any).url();
    } else {
      throw new Error("Unexpected output format from Replicate");
    }

    console.log("Result URL:", resultUrl, typeof resultUrl);

    // Update with success
    await storage.updateGeneration(generationId, {
      status: "completed",
      resultUrl,
      completedAt: new Date(),
    });

    console.log("Generation completed:", { generationId, resultUrl });
  } catch (error) {
    console.error("Error generating image:", error);
    
    // Update with error
    await storage.updateGeneration(generationId, {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
      completedAt: new Date(),
    });
  }
}
