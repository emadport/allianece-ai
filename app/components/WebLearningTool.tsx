"use client";

import { useState } from "react";

type TabType =
  | "scrape"
  | "analyze"
  | "learning"
  | "entities"
  | "keywords"
  | "summarize"
  | "sentiment"
  | "compare";

interface Result {
  type: TabType;
  data: any;
  timestamp: string;
}

export default function WebLearningTool() {
  const [activeTab, setActiveTab] = useState<TabType>("scrape");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Form states
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScrape = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/web/scrape`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
        setResults({
          type: "scrape",
          data,
          timestamp: new Date().toLocaleTimeString(),
        });
      } else {
        setError(data.error || "Failed to scrape URL");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("Please enter text to analyze");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/web/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, url: "manual-input" }),
      });

      const data = await response.json();

      if (data.success) {
        setResults({
          type: "analyze",
          data,
          timestamp: new Date().toLocaleTimeString(),
        });
      } else {
        setError(data.error || "Failed to analyze text");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleExtractLearning = async () => {
    if (!text.trim()) {
      setError("Please enter text");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/web/extract-learning`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (data.success) {
        setResults({
          type: "learning",
          data,
          timestamp: new Date().toLocaleTimeString(),
        });
      } else {
        setError(data.error || "Failed to extract learning data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleExtractEntities = async () => {
    if (!text.trim()) {
      setError("Please enter text");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/web/entities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (data.success) {
        setResults({
          type: "entities",
          data,
          timestamp: new Date().toLocaleTimeString(),
        });
      } else {
        setError(data.error || "Failed to extract entities");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleExtractKeywords = async () => {
    if (!text.trim()) {
      setError("Please enter text");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/web/keywords`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (data.success) {
        setResults({
          type: "keywords",
          data,
          timestamp: new Date().toLocaleTimeString(),
        });
      } else {
        setError(data.error || "Failed to extract keywords");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!text.trim()) {
      setError("Please enter text");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/web/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (data.success) {
        setResults({
          type: "summarize",
          data,
          timestamp: new Date().toLocaleTimeString(),
        });
      } else {
        setError(data.error || "Failed to summarize text");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleSentiment = async () => {
    if (!text.trim()) {
      setError("Please enter text");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/web/sentiment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (data.success) {
        setResults({
          type: "sentiment",
          data,
          timestamp: new Date().toLocaleTimeString(),
        });
      } else {
        setError(data.error || "Failed to analyze sentiment");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!text1.trim() || !text2.trim()) {
      setError("Please enter both texts to compare");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/web/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text1, text2 }),
      });

      const data = await response.json();

      if (data.success) {
        setResults({
          type: "compare",
          data,
          timestamp: new Date().toLocaleTimeString(),
        });
      } else {
        setError(data.error || "Failed to compare texts");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "scrape", label: "Scrape URL", icon: "🌐" },
    { id: "analyze", label: "Analyze", icon: "⚡" },
    { id: "learning", label: "Learning", icon: "✨" },
    { id: "entities", label: "Entities", icon: "🏷️" },
    { id: "keywords", label: "Keywords", icon: "🔑" },
    { id: "summarize", label: "Summarize", icon: "📝" },
    { id: "sentiment", label: "Sentiment", icon: "😊" },
    { id: "compare", label: "Compare", icon: "⚖️" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-3xl">🌐</div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Web Learning Tool
          </h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400">
          Scrape websites and extract insights using AI-powered NLP
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setError(null);
              setResults(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Input Section */}
        {activeTab === "scrape" && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              URL to Scrape
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100"
                onKeyPress={(e) => e.key === "Enter" && handleScrape()}
              />
              <button
                onClick={handleScrape}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? "⏳" : "🌐"} Scrape
              </button>
            </div>
          </div>
        )}

        {activeTab === "analyze" && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Text to Analyze
            </label>
            <textarea
              placeholder="Enter text to analyze..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 mb-4 h-32"
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "⏳" : "⚡"} Analyze
            </button>
          </div>
        )}

        {activeTab === "learning" && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Text to Extract Learning From
            </label>
            <textarea
              placeholder="Enter educational content..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 mb-4 h-32"
            />
            <button
              onClick={handleExtractLearning}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "⏳" : "✨"} Extract Learning
            </button>
          </div>
        )}

        {activeTab === "entities" && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Text
            </label>
            <textarea
              placeholder="Enter text to extract entities from..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 mb-4 h-32"
            />
            <button
              onClick={handleExtractEntities}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "⏳" : "🏷️"} Extract Entities
            </button>
          </div>
        )}

        {activeTab === "keywords" && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Text
            </label>
            <textarea
              placeholder="Enter text to extract keywords from..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 mb-4 h-32"
            />
            <button
              onClick={handleExtractKeywords}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "⏳" : "🔑"} Extract Keywords
            </button>
          </div>
        )}

        {activeTab === "summarize" && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Text
            </label>
            <textarea
              placeholder="Enter text to summarize..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 mb-4 h-32"
            />
            <button
              onClick={handleSummarize}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "⏳" : "📝"} Summarize
            </button>
          </div>
        )}

        {activeTab === "sentiment" && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Text
            </label>
            <textarea
              placeholder="Enter text to analyze sentiment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 mb-4 h-32"
            />
            <button
              onClick={handleSentiment}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "⏳" : "😊"} Analyze Sentiment
            </button>
          </div>
        )}

        {activeTab === "compare" && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Text 1
              </label>
              <textarea
                placeholder="Enter first text..."
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                className="w-full px-4 py-3 border border-zinc-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 h-24"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Text 2
              </label>
              <textarea
                placeholder="Enter second text..."
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                className="w-full px-4 py-3 border border-zinc-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 h-24"
              />
            </div>
            <button
              onClick={handleCompare}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "⏳" : "⚖️"} Compare
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4 flex items-start gap-3">
            <span className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0">
              ❌
            </span>
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-200">
                Error
              </h3>
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-300 dark:border-green-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <h3 className="font-semibold text-green-900 dark:text-green-200">
                  Results ({results.timestamp})
                </h3>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(JSON.stringify(results.data, null, 2))
                }
                className="flex items-center gap-2 px-3 py-1 text-sm bg-green-200 dark:bg-green-800 hover:bg-green-300 dark:hover:bg-green-700 rounded text-green-900 dark:text-green-100"
              >
                {copied ? "✓ Copied" : "📋 Copy JSON"}
              </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words">
                {JSON.stringify(results.data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
