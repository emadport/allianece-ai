import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const modelType = formData.get("modelType") as string; // 'classification' or 'regression'
    const target = formData.get("target") as string; // what to predict
    const value = formData.get("value") as string; // value for prediction

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!modelType) {
      return NextResponse.json(
        { error: "No model type specified" },
        { status: 400 }
      );
    }

    // Create FormData to send to backend (use native FormData)
    const backendFormData = new FormData();
    backendFormData.append("file", file);
    backendFormData.append("model_type", modelType);
    backendFormData.append("target", target || "");
    backendFormData.append("value", value || "");

    // Send to Python backend
    const response = await fetch(`${BACKEND_URL}/api/classify`, {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Backend error: ${errorText}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      prediction: result.prediction,
      confidence: result.confidence,
      modelType: result.model_type,
      target: target || "general analysis",
      value: value || "",
      details: result.details,
    });
  } catch (error) {
    console.error("Classification error:", error);
    return NextResponse.json(
      {
        error: `Server error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
