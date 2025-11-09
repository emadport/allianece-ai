"use client";

import Image from "next/image";
import Link from "next/link";
import WebLearningTool from "../components/WebLearningTool";
import AutoTrainingTool from "../components/AutoTrainingTool";
import { useState, useEffect } from "react";

type ModelType = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

const models: ModelType[] = [
  {
    id: "classification",
    name: "Classification & Prediction",
    description:
      "Upload files to classify or make predictions using advanced machine learning models",
    icon: "🤖",
  },
  {
    id: "unet",
    name: "UNet",
    description:
      "Semantic segmentation with U-Net architecture for detailed mask predictions",
    icon: "🧬",
  },
  {
    id: "rnu",
    name: "RNU (Recurrent Neural Network U-Net)",
    description: "Sequence-aware segmentation with recurrent components",
    icon: "🔄",
  },
  {
    id: "segnet",
    name: "SegNet",
    description:
      "Deep convolutional encoder-decoder architecture for scene segmentation",
    icon: "🏗️",
  },
  {
    id: "deeplab",
    name: "DeepLab",
    description:
      "State-of-the-art semantic segmentation with atrous convolutions",
    icon: "🎯",
  },
];

export default function ModelsPage() {
  const [showWebLearning, setShowWebLearning] = useState(false);
  const [showAutoTraining, setShowAutoTraining] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering state-dependent content until mounted
  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50 p-8 dark:bg-black">
        <div className="mx-auto w-full max-w-6xl space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
              AI Model Gallery
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Select a model to start creating masks and predictions
            </p>
          </div>
          <div className="animate-pulse">
            <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 p-8 dark:bg-black">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        {!showWebLearning && !showAutoTraining ? (
          <>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                AI Model Gallery
              </h1>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Select a model to start creating masks and predictions
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {models.map((model) => (
                <Link
                  key={model.id}
                  href={
                    model.id === "classification"
                      ? "/classification"
                      : `/mask-creator?model=${model.id}`
                  }
                  className="group rounded-lg border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-400 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{model.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        {model.name}
                      </h3>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        {model.description}
                      </p>
                      <div className="mt-4 flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300">
                        Select Model →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Auto Training & Web Learning Section */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8 mt-8 space-y-6">
              {/* Auto Training */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  🤖 Auto Training
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  Just give it a topic and it will automatically search the web,
                  learn, generate data, and train your model!
                </p>
                <button
                  onClick={() => setShowAutoTraining(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 font-semibold transition-all shadow-lg"
                >
                  Start Auto Training →
                </button>
              </div>

              {/* Web Learning */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  🌐 Web Learning Tool
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  Scrape websites and extract insights using AI-powered NLP
                </p>
                <button
                  onClick={() => setShowWebLearning(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold transition-all shadow-lg"
                >
                  Try Web Learning Tool →
                </button>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                ← Back to Home
              </Link>
            </div>
          </>
        ) : showAutoTraining ? (
          <>
            <button
              onClick={() => setShowAutoTraining(false)}
              className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 inline-block"
            >
              ← Back to Gallery
            </button>
            <AutoTrainingTool />
          </>
        ) : (
          <>
            <button
              onClick={() => setShowWebLearning(false)}
              className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 inline-block"
            >
              ← Back to Gallery
            </button>
            <WebLearningTool />
          </>
        )}
      </div>
    </div>
  );
}
