import "dotenv/config";
import express from "express";
import cors from "cors";
import apiRouter from "./api.js";
import { startEventListener } from "./events.js";
import { prisma } from "./db.js";

const app = express();
const PORT = parseInt(process.env.PORT ?? "4000", 10);

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "*" }));
app.use(express.json({ limit: "1mb" }));

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "error", message: "Database unreachable" });
  }
});

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------

app.use(apiRouter);

// ---------------------------------------------------------------------------
// 404 fallback
// ---------------------------------------------------------------------------

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`[indexer] Server listening on http://localhost:${PORT}`);
  console.log(`[indexer] Health check: http://localhost:${PORT}/health`);

  // Start the Sui event listener in the background
  startEventListener();
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[indexer] SIGTERM received, shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("[indexer] SIGINT received, shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});
