"use client";

import { useState } from "react";
import Image from "next/image";

export default function UNetDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
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

      const response = await fetch("/api/unet", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult(`data:image/jpeg;base64,${data.image}`);
      } else {
        setError(data.error || "Prediction failed");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-8 dark:bg-black">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            UNet Image Segmentation Demo
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Upload an image to see the predicted haircut line
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
              {loading ? "Processing..." : "Predict"}
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
                Prediction Result
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
      </div>
    </div>
  );
}
