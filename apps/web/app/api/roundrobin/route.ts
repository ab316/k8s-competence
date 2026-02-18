import { NextResponse } from "next/server";

const apiBaseUrl = process.env.API_BASE_URL || "http://api";

export async function GET() {
  const response = await fetch(`${apiBaseUrl}/whoami`, { cache: "no-store" });
  const payload = await response.json();
  return NextResponse.json(payload, { status: response.status });
}
