import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const isProd = process.env.NODE_ENV === "production";
  
  // Use fileURLToPath + dirname for robust pathing relative to the script itself
  const baseDir = path.dirname(fileURLToPath(import.meta.url));
  const distPath = path.resolve(baseDir, "dist");
  const hasDist = fs.existsSync(distPath);

  console.log(`🚀 SPFIRE Server starting...`);
  console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'unset (defaulting to dev)'}`);
  console.log(`📂 Script Dir: ${baseDir}`);
  console.log(`📦 Dist Folder: ${hasDist ? 'FOUND' : 'MISSING'} at ${distPath}`);

  const app = express();
  
  // Minimalist request logger
  app.use((req, res, next) => {
    if (!req.path.startsWith('/assets')) {
      console.log(`[${new Date().toISOString().split('T')[1].split('.')[0]}] ${req.method} ${req.path}`);
    }
    next();
  });

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  app.use(express.json());

  // API Routes - Always register these first
  app.get("/api/health", (req, res) => {
    let distFiles: string[] = [];
    try {
      if (fs.existsSync(distPath)) {
        distFiles = fs.readdirSync(distPath);
      }
    } catch (e) {
      console.error("Error reading dist directory:", e);
    }

    res.json({ 
      status: "ok", 
      time: new Date().toISOString(),
      env: process.env.NODE_ENV,
      distPath,
      hasDist: fs.existsSync(distPath),
      distFiles
    });
  });

  // Explicitly handle root for faster resolution
  app.get("/", (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    if (!isProd) {
      return res.send("SPFIRE Dev Server: Root index.html not found in dist. Vite should handle this.");
    }
    res.status(500).send("SPFIRE Production Error: Root shell missing.");
  });

  app.get("/ping", (req, res) => {
    res.send("pong");
  });

  // Socket.io for real-time tracking
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("activity:update", (data) => {
      socket.broadcast.emit("activity:stream", data);
    });
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  // Serve static files from dist if they exist
  if (hasDist) {
    console.log("📦 Serving static files from /dist");
    app.use(express.static(distPath));
  }

  // Vite middleware for development
  if (!isProd) {
    console.log("🛠️  Development Mode: Loading Vite middleware...");
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.error("❌ Failed to load Vite middleware:", err);
    }
  }

  // SPA Fallback - Only for non-API routes
  app.get("*", (req, res) => {
    // 1. Exclude API and Ping
    if (req.path.startsWith("/api") || req.path === "/ping") {
      return res.status(404).json({ error: "Endpoint not found" });
    }

    // 2. Resolve index.html path
    const indexPath = path.resolve(distPath, "index.html");
    
    // 3. Serve index.html if it exists
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath, (err) => {
        if (err) {
          console.error(`❌ Sendfile failed for ${indexPath}:`, err);
          if (!res.headersSent) {
             res.status(500).send("Application load error. Check server logs.");
          }
        }
      });
    }

    // 4. Fallback if index.html is missing
    console.error(`❌ File not found at ${indexPath} (Req: ${req.path})`);
    if (isProd) {
      res.status(500).send(`Production Error: Application shell missing. (Path: ${indexPath})`);
    } else {
      res.status(404).send("Dev Asset Missing. Did you run a build?");
    }
  });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`📡 SPFIRE listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("❌ Critical server failure:", err);
  process.exit(1);
});
