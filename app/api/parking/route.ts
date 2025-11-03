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

    // Forward to Python API
    const pythonFormData = new FormData();
    pythonFormData.append("file", file);

    // Create an AbortController with a longer timeout (5 minutes for SAM processing)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes

    try {
      const response = await fetch(`${PYTHON_API_URL}/parking/segment`, {
        method: "POST",
        body: pythonFormData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { success: false, error: data.error || "Segmentation failed" },
          { status: response.status }
        );
      }

      return NextResponse.json(data);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: "Request timed out. The SAM model processing takes several minutes. Please try again." },
          { status: 504 }
        );
      }
      throw fetchError; // Re-throw to outer catch
    }
  } catch (error: any) {
    console.error("API Error:", error);
    
    const errorMessage = error.name === 'AbortError' 
      ? "Request timed out. The SAM model processing takes several minutes."
      : error.message || "Internal server error";
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: error.name === 'AbortError' ? 504 : 500 }
    );
  }
}
