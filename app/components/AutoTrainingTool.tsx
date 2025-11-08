"use client";

import { useState } from "react";

interface TrainingResult {
  success: boolean;
  topic: string;
  duration_seconds?: number;
  steps?: {
    learning?: { success: boolean; urls_processed?: number };
    generation?: { success: boolean; images_generated?: number };
    training?: { success: boolean; model_file?: string };
  };
  error?: string;
}

export default function AutoTrainingTool() {
  const [topic, setTopic] = useState("");
  const [model, setModel] = useState("unet");
  const [detectType, setDetectType] = useState("line_detection");
  const [syntheticImages, setSyntheticImages] = useState(50);
  const [epochs, setEpochs] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrainingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleStartTraining = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentStep("Initializing...");

    try {
      setCurrentStep("🔍 Searching web for content...");

      const response = await fetch(`${API_BASE}/auto-train`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          model,
          detection_type: detectType,
          synthetic_images: syntheticImages,
          epochs,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentStep("✓ Training complete!");
        setResult(data);
      } else {
        setError(data.error || "Training failed");
        setCurrentStep("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setCurrentStep("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-4xl">🧠</div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Web Learning
          </h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400">
          Enter a topic and the system will automatically search the web, learn
          from sources, and build a knowledge base (keywords, entities,
          definitions, concepts).
        </p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700 space-y-6">
        {/* Topic Input */}
        <div>
          <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            📚 What topic do you want to learn about?
          </label>
          <input
            type="text"
            placeholder="e.g., machine learning, animals, plants, technology..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleStartTraining()}
            disabled={loading}
            className="w-full px-4 py-3 border border-zinc-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            The system will search the web, learn from multiple sources, and
            save the knowledge to your knowledge base!
          </p>
        </div>

        {/* Model Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              🧠 Model Type
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 disabled:opacity-50"
            >
              <option value="unet">UNet</option>
              <option value="rnu">RNU (Recurrent)</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 dark:text-red-200">
              Error
            </h3>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Start Button */}
        <button
          onClick={handleStartTraining}
          disabled={loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              Learning from web...
            </>
          ) : (
            <>
              <span>🧠</span>
              Start Learning
            </>
          )}
        </button>
      </div>

      {/* Progress */}
      {currentStep && (
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="animate-pulse text-xl">🔄</span>
            <p className="text-blue-900 dark:text-blue-200 font-semibold">
              {currentStep}
            </p>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
            This may take 2-5 minutes...
          </p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-300 dark:border-green-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">✓</span>
            <h2 className="text-xl font-bold text-green-900 dark:text-green-200">
              Training Complete!
            </h2>
          </div>

          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 space-y-2">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Topic
                </p>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {result.topic}
                </p>
              </div>
              {result.duration_seconds && (
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Duration
                  </p>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {result.duration_seconds.toFixed(1)} seconds
                  </p>
                </div>
              )}
            </div>

            {/* Steps Breakdown */}
            {result.steps && (
              <div className="grid gap-2">
                {result.steps.learning && (
                  <div className="bg-white dark:bg-zinc-900 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <span>{result.steps.learning.success ? "✓" : "✗"}</span>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        Learning from Web
                      </p>
                    </div>
                    {result.steps.learning.urls_processed && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 ml-6">
                        Processed {result.steps.learning.urls_processed} URLs
                      </p>
                    )}
                  </div>
                )}

                {result.steps.generation && (
                  <div className="bg-white dark:bg-zinc-900 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <span>{result.steps.generation.success ? "✓" : "✗"}</span>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        Generating Training Data
                      </p>
                    </div>
                    {result.steps.generation.images_generated && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 ml-6">
                        Generated {result.steps.generation.images_generated}{" "}
                        synthetic images
                      </p>
                    )}
                  </div>
                )}

                {result.steps.training && (
                  <div className="bg-white dark:bg-zinc-900 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <span>{result.steps.training.success ? "✓" : "✗"}</span>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        Training Model
                      </p>
                    </div>
                    {result.steps.training.model_file && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 ml-6">
                        Saved: {result.steps.training.model_file}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                Next Steps:
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>✓ Your model has been trained and saved</li>
                <li>✓ Go to "Mask Creator" to test predictions</li>
                <li>✓ Upload an image to see your model in action!</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
