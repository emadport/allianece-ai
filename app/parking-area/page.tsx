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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setPolygons([]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
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
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-zinc-600 dark:text-zinc-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-zinc-900 file:text-zinc-50
                hover:file:bg-zinc-800
                dark:file:bg-zinc-50 dark:file:text-zinc-900
                dark:hover:file:bg-zinc-100"
            />
            <button
              type="submit"
              disabled={!file || loading}
              className="rounded-lg bg-zinc-900 px-6 py-3 font-semibold text-zinc-50 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              {loading ? "Processing..." : "Detect Parking Spaces"}
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
