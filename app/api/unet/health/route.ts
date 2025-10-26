import { NextResponse } from "next/server";

const PYTHON_API_URL =
  process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";

export async function GET() {
  try {
    const response = await fetch(`${PYTHON_API_URL}/health`);
    const data = await response.json();

    return NextResponse.json({
      nextjs: "ok",
      python: data.status,
    });
  } catch (error) {
    return NextResponse.json(
      { nextjs: "ok", python: "disconnected" },
      { status: 503 }
    );
  }
}
