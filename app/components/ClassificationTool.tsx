"use client";

import { useState, useRef } from "react";
import Image from "next/image";

type PredictionResult = {
  success: boolean;
  prediction: string;
  confidence: number;
  modelType: "classification" | "regression";
  target?: string;
  value?: string;
  details?: Record<string, unknown>;
  error?: string;
};

export default function ClassificationTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [modelType, setModelType] = useState<"classification" | "regression">(
    "classification"
  );
  const [predictionTarget, setPredictionTarget] = useState<string>("");
  const [predictionValue, setPredictionValue] = useState<string>("");
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [columnStats, setColumnStats] = useState<
    Record<string, { min: number; max: number }>
  >({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract columns from CSV or JSON file
  const extractColumnsFromFile = async (file: File) => {
    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const content = await file.text();

      let columns: string[] = [];
      let stats: Record<string, { min: number; max: number }> = {};

      if (fileExt === "csv") {
        // Parse CSV - get headers and calculate min/max for numeric columns
        const lines = content.split("\n").filter((line) => line.trim());
        if (lines.length > 1) {
          columns = lines[0]
            .split(",")
            .map((col) => col.trim())
            .filter((col) => col.length > 0);

          // Extract numeric values for each column
          for (let colIdx = 0; colIdx < columns.length; colIdx++) {
            const values: number[] = [];
            for (let rowIdx = 1; rowIdx < lines.length; rowIdx++) {
              const cells = lines[rowIdx].split(",");
              const val = parseFloat(cells[colIdx]);
              if (!isNaN(val)) {
                values.push(val);
              }
            }
            if (values.length > 0) {
              stats[columns[colIdx]] = {
                min: Math.min(...values),
                max: Math.max(...values),
              };
            }
          }
        }
      } else if (fileExt === "json") {
        // Parse JSON - extract keys and calculate stats
        try {
          const data = JSON.parse(content);
          let firstObj: Record<string, unknown> = {};

          if (Array.isArray(data) && data.length > 0) {
            firstObj = data[0] as Record<string, unknown>;
            columns = Object.keys(firstObj);

            // Calculate min/max for numeric columns across all objects
            for (const col of columns) {
              const values: number[] = [];
              for (const obj of data) {
                if (typeof obj === "object" && obj !== null) {
                  const val = (obj as Record<string, unknown>)[col];
                  const numVal =
                    typeof val === "number" ? val : parseFloat(String(val));
                  if (!isNaN(numVal)) {
                    values.push(numVal);
                  }
                }
              }
              if (values.length > 0) {
                stats[col] = {
                  min: Math.min(...values),
                  max: Math.max(...values),
                };
              }
            }
          } else if (typeof data === "object") {
            columns = Object.keys(data);
          }
        } catch {
          columns = [];
        }
      }

      setAvailableColumns(columns);
      setColumnStats(stats);
      if (columns.length > 0 && !predictionTarget) {
        setPredictionTarget(columns[0]); // Auto-select first column
      }
    } catch (error) {
      console.error("Error extracting columns:", error);
      setAvailableColumns([]);
      setColumnStats({});
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setAvailableColumns([]);
    setPredictionTarget("");

    // Create preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview("");
      // Extract columns for CSV/JSON
      extractColumnsFromFile(selectedFile);
    }

    setResult(null);
  };

  const handlePredict = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("modelType", modelType);
      formData.append("target", predictionTarget || "");
      formData.append("value", predictionValue || "");

      // Simulate progress (since fetch API doesn't have built-in progress for uploads)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch("/api/classification", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        setResult({
          success: false,
          prediction: "",
          confidence: 0,
          modelType,
          error: data.error || "Prediction failed",
        });
      } else {
        setResult(data);
      }
    } catch (error) {
      setResult({
        success: false,
        prediction: "",
        confidence: 0,
        modelType,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 500);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview("");
    setResult(null);
    setUploadProgress(0);
    setPredictionTarget("");
    setPredictionValue("");
    setAvailableColumns([]);
    setColumnStats({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          🤖 Classification & Prediction
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Upload a file to classify or make predictions using AI models
        </p>
      </div>

      {/* Prediction Target Input - Smart Column Selection */}
      <div className="mb-8 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
        <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
          {availableColumns.length > 0
            ? "Column to Predict or Classify"
            : "What to Predict or Classify?"}
          {availableColumns.length > 0 && (
            <span className="text-green-600 dark:text-green-400 ml-2">
              ✓ Auto-detected
            </span>
          )}
        </label>

        {availableColumns.length > 0 ? (
          <>
            <select
              value={predictionTarget}
              onChange={(e) => setPredictionTarget(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">-- Select a column --</option>
              {availableColumns.map((col) => {
                const stats = columnStats[col];
                const statsText = stats
                  ? ` (${stats.min.toFixed(1)} - ${stats.max.toFixed(1)})`
                  : "";
                return (
                  <option key={col} value={col}>
                    {col}
                    {statsText}
                  </option>
                );
              })}
            </select>
            <p className="mt-2 text-xs text-green-600 dark:text-green-400">
              📊 {availableColumns.length} columns found in your file
            </p>
            {predictionTarget && columnStats[predictionTarget] && (
              <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  📈 {predictionTarget} Range:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                    <div className="text-green-700 dark:text-green-300">
                      Min
                    </div>
                    <div className="font-mono font-bold text-green-900 dark:text-green-200">
                      {columnStats[predictionTarget].min.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                    <div className="text-blue-700 dark:text-blue-300">Max</div>
                    <div className="font-mono font-bold text-blue-900 dark:text-blue-200">
                      {columnStats[predictionTarget].max.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Value Input - Show when column selected */}
            {predictionTarget && (
              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  Enter value to predict for:{" "}
                  <span className="text-green-600">{predictionTarget}</span>
                </label>
                <input
                  type="text"
                  placeholder={`e.g., 0.5, high, John, 150...`}
                  value={predictionValue}
                  onChange={(e) => setPredictionValue(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                  Enter any value for "{predictionTarget}" to make predictions
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Upload a CSV/JSON file first to see columns, or describe what to predict..."
              value={predictionTarget}
              onChange={(e) => setPredictionTarget(e.target.value)}
              disabled={file !== null && !availableColumns.length}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
              Upload a CSV or JSON file to see available columns, or enter
              custom prediction target
            </p>
          </>
        )}
      </div>

      {/* Model Type Selection */}
      <div className="mb-8 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
        <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Model Type
        </label>
        <div className="grid grid-cols-2 gap-4">
          {(["classification", "regression"] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                setModelType(type);
                setResult(null);
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                modelType === type
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-600"
              }`}
            >
              <div className="text-2xl mb-2">
                {type === "classification" ? "🏷️" : "📈"}
              </div>
              <div className="font-semibold capitalize">{type}</div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                {type === "classification"
                  ? "Categorize into classes"
                  : "Predict numerical values"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* File Upload Area */}
      <div className="mb-8 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-8">
        <div
          className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add("border-blue-400", "bg-blue-50");
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("border-blue-400", "bg-blue-50");
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("border-blue-400", "bg-blue-50");
            const droppedFile = e.dataTransfer.files?.[0];
            if (droppedFile) {
              const event = new Event("change", { bubbles: true });
              Object.defineProperty(event, "target", {
                value: { files: [droppedFile] },
              });
              handleFileChange(event as any);
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.csv,.json,.txt"
          />
          <div className="text-4xl mb-4">📁</div>
          <div className="text-zinc-900 dark:text-zinc-100 font-semibold mb-2">
            {file ? "File Selected" : "Click or drag file here"}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Supported: Images, CSV, JSON, TXT files
          </div>
          {file && (
            <div className="mt-4 text-sm text-blue-600 dark:text-blue-400">
              {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="mb-8 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Preview
          </h3>
          <div className="relative w-full h-64 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
            <Image
              src={preview}
              alt="File preview"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mb-8 flex gap-4">
        <button
          onClick={handlePredict}
          disabled={!file || loading}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-lg"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Predicting...
            </div>
          ) : (
            "🚀 Predict"
          )}
        </button>
        <button
          onClick={handleClear}
          disabled={!file && !result}
          className="px-6 py-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
        >
          Clear
        </button>
      </div>

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mb-8 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Upload Progress
            </span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {uploadProgress}%
            </span>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-blue-700 h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div
          className={`rounded-lg border p-6 ${
            result.success
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          }`}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            {result.success ? (
              <>
                <span className="text-2xl">✅</span>
                <span className="text-green-900 dark:text-green-100">
                  Prediction Result
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl">❌</span>
                <span className="text-red-900 dark:text-red-100">Error</span>
              </>
            )}
          </h3>

          {result.success ? (
            <div className="space-y-4">
              <div className="bg-white dark:bg-zinc-800 rounded-lg p-4">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                  Target
                </div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {result.target || "general analysis"}
                </div>
                {result.value && (
                  <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                    Value: <span className="font-mono">{result.value}</span>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-zinc-800 rounded-lg p-4">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                  Prediction
                </div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {result.prediction}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-4">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                    Confidence
                  </div>
                  <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                    {(result.confidence * 100).toFixed(2)}%
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-4">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                    Model Type
                  </div>
                  <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 capitalize">
                    {result.modelType}
                  </div>
                </div>
              </div>

              {result.details && (
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-4">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                    Details
                  </div>
                  <pre className="text-xs text-zinc-900 dark:text-zinc-100 overflow-x-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-4">
              <div className="text-red-900 dark:text-red-100 font-semibold">
                {result.error}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
