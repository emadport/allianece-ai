import { NextRequest, NextResponse } from "next/server";

const PYTHON_API_URL =
  process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const model = searchParams.get("model") || "unet";
    const type = searchParams.get("type") || "haircut";

    // Forward to Python API
    const pythonFormData = new FormData();
    pythonFormData.append("file", file);

    const response = await fetch(
      `${PYTHON_API_URL}/predict?model=${model}&type=${type}`,
      {
        method: "POST",
        body: pythonFormData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || "Prediction failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
