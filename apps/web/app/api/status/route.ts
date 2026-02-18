import type { HealthResponse } from "@kc/shared-types";
import { NextResponse } from "next/server";

const apiBaseUrl = process.env.API_BASE_URL || "http://api";

export async function GET() {
  const nextTimestamp = new Date().toISOString();

  try {
    const response = await fetch(`${apiBaseUrl}/health`, { cache: "no-store" });
    const apiPayload = (await response.json()) as HealthResponse;

    return NextResponse.json({
      nextjs: {
        status: "ok",
        timestamp: nextTimestamp,
        apiBaseUrl
      },
      api: apiPayload,
      apiReachable: response.ok
    });
  } catch {
    return NextResponse.json({
      nextjs: {
        status: "ok",
        timestamp: nextTimestamp,
        apiBaseUrl
      },
      api: null,
      apiReachable: false
    });
  }
}
