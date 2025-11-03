"use client";

import { useRef, useCallback, useState } from "react";

interface MaskCanvasProps {
  imageUrl: string;
  onMaskDrawn: (maskDataUrl: string) => void;
}

export default function MaskCanvas({ imageUrl, onMaskDrawn }: MaskCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#FFFFFF");
  const [brushSize, setBrushSize] = useState(10);

  // NEW STATE for Straight Line functionality
  const [isStraightMode, setIsStraightMode] = useState(false);
  const [straightLineStart, setStraightLineStart] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Logic to handle both modes on mouse down
      if (isStraightMode) {
        setStraightLineStart({ x, y }); // Just record the start point
      } else {
        setIsDrawing(true); // Start continuous drawing
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    },
    [isStraightMode]
  );

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      // Only execute for Freehand Mode
      if (!isDrawing || isStraightMode) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.strokeStyle = brushColor;
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    },
    [isDrawing, brushSize, brushColor, isStraightMode]
  );

  const stopDrawing = useCallback(
    (e?: React.MouseEvent<HTMLCanvasElement>) => {
      // Check if event object exists to confirm it was a mouseUp/mouseLeave
      const isMouseUpOrLeave = !!e;

      // Logic to handle Straight Line Mode on mouse up/leave
      if (isStraightMode && straightLineStart && isMouseUpOrLeave) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Calculate end point (e is guaranteed to be present here)
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;

        // Draw the single straight line segment
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";
        ctx.strokeStyle = brushColor;

        ctx.beginPath();
        ctx.moveTo(straightLineStart.x, straightLineStart.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        setStraightLineStart(null); // Reset start point
      }

      setIsDrawing(false); // Stop continuous drawing
    },
    [isStraightMode, straightLineStart, brushSize, brushColor]
  );

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveMask = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check if canvas has any drawings
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasDrawing = imageData.data.some((channel) => channel !== 0);

    if (!hasDrawing) {
      alert("⚠️ Please draw a mask on the image first!");
      return;
    }

    // Create a new canvas with black background
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext("2d");
    if (!maskCtx) return;

    // Fill with black background
    maskCtx.fillStyle = "#000000";
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    // Draw the user's drawing on top (which should be white or colored)
    maskCtx.drawImage(canvas, 0, 0);

    // Convert to data URL
    const maskDataUrl = maskCanvas.toDataURL("image/png");
    onMaskDrawn(maskDataUrl);

    // Show success feedback
    alert("✓ Mask saved! You can now train the model or run prediction.");
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="grid gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800 sm:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Brush Size: {brushSize}px
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Brush Color
          </label>
          <input
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            className="h-10 w-full cursor-pointer rounded"
          />
        </div>

        {/* NEW MODE TOGGLE BUTTON */}
        <div className="flex flex-col gap-2">
          <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Drawing Mode
          </label>
          <button
            onClick={() => setIsStraightMode((prev) => !prev)}
            className={`rounded px-4 py-2 font-semibold transition ${
              isStraightMode
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-zinc-300 text-zinc-900 hover:bg-zinc-400 dark:bg-zinc-700 dark:text-zinc-100"
            }`}
          >
            {isStraightMode ? "Straight Line" : "Freehand"}
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={clearCanvas}
            className="rounded bg-zinc-300 px-4 py-2 font-semibold text-zinc-900 hover:bg-zinc-400 dark:bg-zinc-700 dark:text-zinc-100"
          >
            Clear
          </button>
          <button
            onClick={saveMask}
            className="rounded bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
          >
            Save Mask
          </button>
        </div>
      </div>
      <div className="relative inline-block">
        <img
          src={imageUrl}
          alt="Mask drawing"
          className="max-w-full"
          onLoad={(e) => {
            const canvas = canvasRef.current;
            const img = e.currentTarget;
            if (canvas && img) {
              canvas.width = img.clientWidth;
              canvas.height = img.clientHeight;
            }
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute left-0 top-0 cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing} // Use stopDrawing on mouse leave as well
        />
      </div>
    </div>
  );
}
