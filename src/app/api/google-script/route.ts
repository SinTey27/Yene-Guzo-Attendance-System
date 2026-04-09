// src/app/api/google-script/route.ts
import { NextRequest, NextResponse } from "next/server";

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || "";

export async function POST(request: NextRequest) {
  try {
    if (!GOOGLE_SCRIPT_URL) {
      console.error("GOOGLE_SCRIPT_URL is not set!");
      return NextResponse.json(
        { success: false, message: "GOOGLE_SCRIPT_URL not configured" },
        { status: 500 },
      );
    }

    const body = await request.json();
    console.log("Proxying request:", body.action);

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to connect to Google Sheets" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "API route is working. Use POST requests.",
    scriptUrl: process.env.GOOGLE_SCRIPT_URL ? "Configured" : "Not configured",
  });
}
