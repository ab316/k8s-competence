import { NextRequest, NextResponse } from "next/server";

const apiBaseUrl = process.env.API_BASE_URL || "http://api";

export async function GET() {
  const response = await fetch(`${apiBaseUrl}/notes`, { cache: "no-store" });
  const payload = await response.json();
  return NextResponse.json(payload, { status: response.status });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const response = await fetch(`${apiBaseUrl}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const payload = await response.json();
  return NextResponse.json(payload, { status: response.status });
}
