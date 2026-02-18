import { Pool } from "pg";
import { loadConfig } from "./config";

const config = loadConfig();

export const pool = new Pool({
  host: config.dbHost,
  port: config.dbPort,
  database: config.dbName,
  user: config.dbUser,
  password: config.dbPassword
});

const createNotesTableSql = `
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

export async function ensureSchema(): Promise<void> {
  await pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
  await pool.query(createNotesTableSql);
}

export async function waitForDatabase(
  maxAttempts = 30,
  delayMs = 2000
): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await pool.query("SELECT 1");
      await ensureSchema();
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `[db] attempt ${attempt}/${maxAttempts} failed: ${message}`
      );

      if (attempt === maxAttempts) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
