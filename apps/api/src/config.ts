export interface ApiConfig {
  port: number;
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  dbPassword: string;
}

function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function loadConfig(): ApiConfig {
  return {
    port: toNumber(process.env.PORT, 4000),
    dbHost: process.env.DB_HOST || "db",
    dbPort: toNumber(process.env.DB_PORT, 5432),
    dbName: process.env.DB_NAME || "study",
    dbUser: process.env.DB_USER || "study",
    dbPassword: process.env.DB_PASSWORD || "study"
  };
}
