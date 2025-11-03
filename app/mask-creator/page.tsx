"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import MaskCanvas from "./components/MaskCanvas";

type ModelType = "haircut" | "custom";

function MaskCreatorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedModel = searchParams.get("model") || "unet";
  const urlDetectionType = searchParams.get("type") || "haircut";

  const [modelType, setModelType] = useState<ModelType>(
    urlDetectionType as ModelType
  );

  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [maskData, setMaskData] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [trainingStatus, setTrainingStatus] = useState<
    "running" | "completed" | "error" | null
  >(null);
  useEffect(() => {
    setImage(null);
    setImageFile(null);
    setMaskData(null);
    setResult(null);
    setError(null);
    setIsGenerating(false);
    setIsTraining(false);
  }, [modelType]);
  useEffect(() => {
    // Update model type based on URL parameter
    if (selectedModel === "unet") {
      setModelType("haircut");
    }
  }, [selectedModel]);

  // Poll training status when training is active
  useEffect(() => {
    if (!isTraining) return;

    const pollStatus = async () => {
      const pythonApiUrl =
        process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";
      try {
        const response = await fetch(
          `${pythonApiUrl}/train/status?model=${selectedModel}&type=${modelType}`
        );
        const data = await response.json();

        if (data.success) {
          setTrainingStatus(data.status);
          setTrainingLogs(data.logs);

          // If completed or error, stop polling and reset training state
          if (data.status === "completed") {
            setIsTraining(false);
            setTrainingStatus(null);
          } else if (data.status === "error") {
            setIsTraining(false);
            setTrainingStatus(null);
          }
        }
      } catch (err) {
        console.error("Failed to poll training status:", err);
      }
    };

    // Poll immediately, then every 2 seconds
    pollStatus();
    const interval = setInterval(pollStatus, 2000);

    return () => clearInterval(interval);
  }, [isTraining, selectedModel, modelType]);

  const handleMaskDrawn = useCallback(
    async (maskDataUrl: string, currentModelType: ModelType) => {
      setMaskData(maskDataUrl);

      // Convert data URL to blob and send to API
      try {
        const response = await fetch(maskDataUrl);
        const blob = await response.blob();
        const formData = new FormData();
        formData.append("mask", blob, "mask.png");
        if (imageFile) {
          formData.append("original", imageFile, "original.png");
        }

        console.log(
          "Saving with modelType:",
          currentModelType,
          "model:",
          selectedModel
        );
        const pythonApiUrl =
          process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";
        const saveResponse = await fetch(
          `${pythonApiUrl}/save_mask?model=${selectedModel}&type=${currentModelType}`,
          {
            method: "POST",
            body: formData,
          }
        );

        const saveData = await saveResponse.json();
        console.log("Save response:", saveData);

        if (saveResponse.ok) {
          alert("✓ Mask and image saved to disk!");
        }
      } catch (err) {
        console.error("Failed to save mask:", err);
      }
    },
    [imageFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setMaskData(null);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateMask = () => {
    // This would open the Gradio mask_drawer interface
    // Or we could implement canvas-based mask drawing here
    if (image) {
      alert(
        "Open http://localhost:7860 in a new tab to use the advanced mask drawing tool"
      );
    }
  };

  const handlePredict = async () => {
    if (!imageFile) return;

    setIsGenerating(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await fetch(
        `/api/unet?model=${selectedModel}&type=${modelType}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setResult(`data:image/jpeg;base64,${data.image}`);
      } else {
        setError(data.error || "Prediction failed");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 p-8 dark:bg-black">
      <div className="mx-auto w-full max-w-6xl space-y-8">
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
            {selectedModel.toUpperCase()} Model
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Upload images, create masks, train, and predict
          </p>
        </div>

        {/* Detection Type Selection */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Select Detection Type
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <button
              onClick={() => {
                console.log("Setting modelType to: haircut");
                setModelType("haircut");
                router.push(
                  `/mask-creator?model=${selectedModel}&type=haircut`,
                  { scroll: false }
                );
              }}
              className={`rounded-lg border-2 px-6 py-4 font-semibold transition-colors ${
                modelType === "haircut"
                  ? "border-blue-600 bg-blue-50 text-blue-900 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-100"
                  : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              <div className="text-2xl mb-2">✂️</div>
              <div className="font-bold">Haircut Line Detection</div>
              <div className="mt-1 text-xs opacity-70">
                Detects ideal haircut lines on faces
              </div>
            </button>
            <button
              onClick={() => {
                console.log("Setting modelType to: custom");
                setModelType("custom");
                router.push(
                  `/mask-creator?model=${selectedModel}&type=custom`,
                  { scroll: false }
                );
              }}
              className={`rounded-lg border-2 px-6 py-4 font-semibold transition-colors ${
                modelType === "custom"
                  ? "border-blue-600 bg-blue-50 text-blue-900 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-100"
                  : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              <div className="text-2xl mb-2">📷</div>
              <div className="font-bold">Camera Detection</div>
              <div className="mt-1 text-xs opacity-70">
                Detects camera positions and angles
              </div>
            </button>
          </div>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Each type uses separate image/mask folders and models
          </p>
          <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm font-semibold text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
            📂 Currently selected:{" "}
            <strong>
              {modelType === "haircut"
                ? "Haircut Line Detection"
                : "Camera Detection"}
            </strong>
            <br />
            Model: <strong>{selectedModel.toUpperCase()}</strong>
            <br />
            Will save to:{" "}
            <code>
              images_{selectedModel.toUpperCase()}_{modelType}/
            </code>{" "}
            and{" "}
            <code>
              masks_{selectedModel.toUpperCase()}_{modelType}/
            </code>
          </div>
        </div>

        {/* Image Upload */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Upload Image
          </h2>
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
          {image && (
            <div className="mt-4 flex items-center gap-4">
              <div className="relative h-48 w-48 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                <Image
                  src={image}
                  alt="Uploaded"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    const newWindow = window.open(
                      "http://localhost:7860",
                      "_blank"
                    );
                    // Copy image URL to clipboard
                    navigator.clipboard.writeText(image || "");
                    alert(
                      "Image URL copied! Paste it into the 'Or enter image URL' field in the mask editor."
                    );
                  }}
                  className="rounded bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  🎨 Open Mask Editor
                </button>
                <a
                  href={image}
                  download="uploaded-image.png"
                  className="rounded border border-zinc-300 bg-white px-4 py-2 text-center text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  📥 Download Image
                </a>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Upload the image in the mask editor
                </p>
              </div>
            </div>
          )}
          {image && (
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Draw Mask on Image
                </h3>
                <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                  Click and drag to draw your mask directly on the image
                </p>
              </div>
              <MaskCanvas
                imageUrl={image}
                onMaskDrawn={(maskDataUrl) =>
                  handleMaskDrawn(maskDataUrl, modelType)
                }
              />
              {maskData && (
                <div className="mt-4">
                  <div className="rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <p className="font-semibold">
                      ✓ Mask created successfully!
                    </p>
                    <p className="text-sm mt-1">
                      Scroll down to click "Run Prediction" to see the results.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Training */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Model Training
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Train the model with images and masks in the folders
              </p>
            </div>
            <button
              onClick={async () => {
                setIsTraining(true);
                try {
                  const pythonApiUrl =
                    process.env.NEXT_PUBLIC_PYTHON_API_URL ||
                    "http://localhost:8000";
                  const response = await fetch(
                    `${pythonApiUrl}/train?model=${selectedModel}&type=${modelType}`,
                    {
                      method: "POST",
                    }
                  );
                  const data = await response.json();
                  if (data.success) {
                    // No alert, just let the status polling handle it
                  } else {
                    alert(`Training failed: ${data.error}`);
                    setIsTraining(false);
                  }
                } catch (err) {
                  alert("Failed to start training");
                  setIsTraining(false);
                }
              }}
              disabled={isTraining}
              className="rounded bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isTraining ? "Training in Progress..." : "🚀 Train Model"}
            </button>
          </div>

          {/* Training Progress */}
          {isTraining && trainingLogs.length > 0 && (
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
              <h4 className="mb-2 font-semibold text-purple-900 dark:text-purple-100">
                Training Progress:
              </h4>
              <div className="max-h-64 space-y-1 overflow-y-auto font-mono text-sm text-purple-800 dark:text-purple-200">
                {trainingLogs.slice(-10).map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Prediction */}
        {image && (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Prediction
              </h2>
              <button
                onClick={handlePredict}
                disabled={isGenerating}
                className="rounded bg-zinc-900 px-6 py-3 font-semibold text-zinc-50 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                {isGenerating ? "Generating..." : "Run Prediction"}
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                <p className="font-semibold">Error: {error}</p>
              </div>
            )}

            {result && (
              <div className="mt-4">
                <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Result:
                </h3>
                <div className="relative aspect-square max-w-md overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <img
                    src={result}
                    alt="Prediction result"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MaskCreator() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MaskCreatorContent />
    </Suspense>
  );
}
