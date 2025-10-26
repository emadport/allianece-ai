"use client";

import Image from "next/image";
import Link from "next/link";

type ModelType = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

const models: ModelType[] = [
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

        <div className="grid gap-6 md:grid-cols-2">
          {models.map((model) => (
            <Link
              key={model.id}
              href={`/mask-creator?model=${model.id}`}
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

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

