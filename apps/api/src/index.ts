import { randomUUID } from "crypto";
import os from "os";
import cors from "cors";
import express from "express";
import type {
  CreateNoteRequest,
  CreateNoteResponse,
  HealthResponse,
  Note,
  WhoAmIResponse
} from "@kc/shared-types";
import { loadConfig } from "./config";
import { pool, waitForDatabase } from "./db";

const config = loadConfig();
const app = express();

const instanceId = randomUUID();
const podName = process.env.HOSTNAME || os.hostname() || "unknown-pod";

function toIsoString(value: unknown): string {
  return typeof value === "string"
    ? value
    : value instanceof Date
      ? value.toISOString()
      : new Date().toISOString();
}

app.use(cors());
app.use(express.json());

app.get("/whoami", (_req, res) => {
  const payload: WhoAmIResponse = {
    podName,
    instanceId,
    timestamp: new Date().toISOString()
  };

  res.json(payload);
});

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    const payload: HealthResponse = {
      status: "ok",
      database: "up",
      podName,
      instanceId,
      timestamp: new Date().toISOString()
    };
    res.json(payload);
  } catch (error) {
    const payload: HealthResponse = {
      status: "error",
      database: "down",
      podName,
      instanceId,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error)
    };
    res.status(500).json(payload);
  }
});

app.get("/notes", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, content, created_at FROM notes ORDER BY created_at DESC"
    );

    const notes: Note[] = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      createdAt: toIsoString(row.created_at)
    }));

    res.json({ notes });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch notes",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

app.post("/notes", async (req, res) => {
  const body = req.body as CreateNoteRequest;

  if (!body?.title || !body?.content) {
    res.status(400).json({ error: "title and content are required" });
    return;
  }

  try {
    const result = await pool.query(
      "INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING id, title, content, created_at",
      [body.title, body.content]
    );

    const row = result.rows[0];
    const payload: CreateNoteResponse = {
      note: {
        id: row.id,
        title: row.title,
        content: row.content,
        createdAt: toIsoString(row.created_at)
      }
    };

    res.status(201).json(payload);
  } catch (error) {
    res.status(500).json({
      error: "Failed to create note",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

async function bootstrap(): Promise<void> {
  console.log("[config] starting api with defaults/overrides", {
    port: config.port,
    dbHost: config.dbHost,
    dbPort: config.dbPort,
    dbName: config.dbName,
    dbUser: config.dbUser
  });

  await waitForDatabase();

  app.listen(config.port, () => {
    console.log(`[api] listening on ${config.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("[api] failed to start", error);
  process.exit(1);
});
