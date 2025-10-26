import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDatabase();
    const datasets = await db.collection("datasets")
      .find({})
      .sort({ created_at: -1 })
      .toArray();
    
    return NextResponse.json({
      success: true,
      datasets: datasets.map(d => ({
        model: d.model,
        detection_type: d.detection_type,
        image_filename: d.image_filename,
        created_at: d.created_at,
        folders: d.folders
      }))
    });
  } catch (error) {
    console.error("MongoDB Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch datasets" },
      { status: 500 }
    );
  }
}

