"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

// Dynamically import Map component to avoid SSR issues
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-96 w-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 rounded-lg">
      Loading map...
    </div>
  ),
});

export default function ParkingAreaDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polygons, setPolygons] = useState<any[]>([]);
  const [geoBounds, setGeoBounds] = useState<{
    northEast: { lat: number; lng: number };
    southWest: { lat: number; lng: number };
  } | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const compressImage = (
    file: File
  ): Promise<{ dataUrl: string; blob: Blob }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.onload = () => {
          // Calculate new dimensions (max 800px on longest side)
          const MAX_SIZE = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = (height * MAX_SIZE) / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = (width * MAX_SIZE) / height;
              height = MAX_SIZE;
            }
          }

          // Create canvas and resize
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob (JPEG with 85% quality for smaller size)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
                resolve({ dataUrl, blob });
              } else {
                reject(new Error("Failed to create blob"));
              }
            },
            "image/jpeg",
            0.85
          );
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check for HEIC format (iPhone photos)
    const fileExtension = selectedFile.name.toLowerCase().split(".").pop();
    if (fileExtension === "heic" || fileExtension === "heif") {
      alert(
        '⚠️ HEIC format detected. Please convert to JPG first:\n\n1. Open photo on iPhone\n2. Share → Save to Files\n3. Choose "JPEG" format\n4. Upload the converted file'
      );
      e.target.value = "";
      return;
    }

    // Check file size (warn if > 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      const proceed = confirm(
        "⚠️ Large file detected (" +
          Math.round(selectedFile.size / 1024 / 1024) +
          "MB). This may take a moment to process. Continue?"
      );
      if (!proceed) {
        e.target.value = "";
        return;
      }
    }

    setIsCompressing(true);
    setResult(null);
    setPolygons([]);
    setError(null);

    try {
      // Add timeout for compression (30 seconds)
      const compressionPromise = compressImage(selectedFile);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Compression timeout")), 30000)
      );

      const { dataUrl, blob } = await Promise.race([
        compressionPromise,
        timeoutPromise,
      ]);

      // Create a new File object from the compressed blob
      const compressedFile = new File(
        [blob],
        selectedFile.name.replace(/\.\w+$/, ".jpg"),
        { type: "image/jpeg" }
      );

      setFile(compressedFile);
      setPreview(dataUrl);
    } catch (err) {
      console.error("Failed to compress image:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      if (errorMessage.includes("timeout")) {
        alert(
          "⚠️ Image processing timed out. Your photo might be too large. Try:\n\n1. Taking a lower resolution photo\n2. Using a photo editing app to reduce size\n3. Converting to JPG format"
        );
        e.target.value = "";
      } else {
        alert("⚠️ Could not process image. Using original file (may be slow).");
        // Fallback to original file
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.onerror = () => {
          alert("❌ Failed to read image file. Please try a different photo.");
          e.target.value = "";
        };
        reader.readAsDataURL(selectedFile);
      }
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parking", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult(`data:image/jpeg;base64,${data.image}`);
        setPolygons(data.polygons || []);
      } else {
        setError(data.error || "Segmentation failed");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-8 dark:bg-black">
      <div className="w-full max-w-6xl space-y-8">
        <div>
          <a
            href="/models"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to Models
          </a>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            Parking Area Segmentation
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Upload a parking lot image to automatically detect and create
            polygons for each parking space
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              <strong>💡 Note:</strong> Images are compressed on upload (max
              800px) for faster processing.
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isCompressing}
              className="block w-full text-sm text-zinc-600 dark:text-zinc-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-zinc-900 file:text-zinc-50
                hover:file:bg-zinc-800
                dark:file:bg-zinc-50 dark:file:text-zinc-900
                dark:hover:file:bg-zinc-100
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {isCompressing && (
              <div className="rounded-lg bg-blue-50 p-4 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-800 border-t-transparent dark:border-blue-400"></div>
                  <span className="font-semibold">
                    Processing image... This may take a moment for large photos.
                  </span>
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={!file || loading || isCompressing}
              className="rounded-lg bg-zinc-900 px-6 py-3 font-semibold text-zinc-50 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              {loading
                ? "Detecting Parking Spaces..."
                : "Detect Parking Spaces"}
            </button>
          </div>
        </form>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <p className="font-semibold">Error: {error}</p>
            <p className="text-sm mt-1">
              Make sure the Python server is running:
            </p>
            <code className="block mt-2 text-xs bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded">
              npm run python:dev
            </code>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {preview && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Original Image
              </h3>
              <div className="relative aspect-square overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                <Image
                  src={preview}
                  alt="Original"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Detected Parking Spaces
              </h3>
              <div className="relative aspect-square overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                <img
                  src={result}
                  alt="Result"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {polygons.length > 0 && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Parking Spaces Detected: {polygons.length}
            </h3>
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {polygons.map((polygon, idx) => (
                <div
                  key={idx}
                  className="rounded bg-zinc-100 p-3 dark:bg-zinc-800"
                >
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Parking Space #{idx + 1}
                  </div>
                  <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    {polygon.points?.length || 0} points
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Geo Coordinate Selection */}
        {polygons.length > 0 && preview && !geoBounds && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Set Parking Area Location on Map
            </h3>
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              Enter the coordinates of the parking area corners to map polygons
              to real-world locations
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                  North-East Corner
                </label>
                <div className="grid gap-2 grid-cols-2">
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    id="ne-lat"
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    id="ne-lng"
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                  South-West Corner
                </label>
                <div className="grid gap-2 grid-cols-2">
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    id="sw-lat"
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    id="sw-lng"
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                const neLat = (
                  document.getElementById("ne-lat") as HTMLInputElement
                )?.value;
                const neLng = (
                  document.getElementById("ne-lng") as HTMLInputElement
                )?.value;
                const swLat = (
                  document.getElementById("sw-lat") as HTMLInputElement
                )?.value;
                const swLng = (
                  document.getElementById("sw-lng") as HTMLInputElement
                )?.value;

                if (neLat && neLng && swLat && swLng) {
                  setGeoBounds({
                    northEast: {
                      lat: parseFloat(neLat),
                      lng: parseFloat(neLng),
                    },
                    southWest: {
                      lat: parseFloat(swLat),
                      lng: parseFloat(swLng),
                    },
                  });
                } else {
                  alert("Please enter all coordinate values");
                }
              }}
              className="mt-4 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Map to Real World Location
            </button>
          </div>
        )}

        {/* Mapbox Visualization */}
        {polygons.length > 0 && preview && geoBounds && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Parking Map Visualization
            </h3>
            <MapComponent
              imageUrl={preview}
              polygons={polygons}
              geoBounds={geoBounds}
            />
          </div>
        )}
      </div>
    </div>
  );
}
