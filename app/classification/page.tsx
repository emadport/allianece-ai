"use client";

import Link from "next/link";
import ClassificationTool from "../components/ClassificationTool";

export default function ClassificationPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-zinc-50 via-blue-50 to-zinc-50 dark:from-black dark:via-blue-950 dark:to-black p-8">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        {/* Back Button */}
        <Link
          href="/models"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          ← Back to Models
        </Link>

        {/* Main Content */}
        <ClassificationTool />

        {/* Footer */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8 mt-12">
          <div className="text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Powered by advanced ML models • Classification & Regression
              capabilities
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <Link
                href="/"
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Home
              </Link>
              <span className="text-zinc-400">•</span>
              <Link
                href="/models"
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Models
              </Link>
              <span className="text-zinc-400">•</span>
              <Link
                href="/mask-creator"
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Mask Creator
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
