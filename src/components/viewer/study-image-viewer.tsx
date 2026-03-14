"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type StudyImageViewerProps = {
  imageUrl: string | null;
};

type Point = {
  x: number;
  y: number;
};

export function StudyImageViewer({ imageUrl }: StudyImageViewerProps) {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [origin, setOrigin] = useState<Point>({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  const imageStyle = useMemo(
    () => ({
      filter: `brightness(${brightness}%) contrast(${contrast}%)`,
      transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
      transformOrigin: "center center",
    }),
    [brightness, contrast, offset.x, offset.y, scale],
  );

  function resetControls() {
    setBrightness(100);
    setContrast(100);
    setOffset({ x: 0, y: 0 });
    setScale(1);
  }

  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    setDragging(true);
    setOrigin({ x: event.clientX - offset.x, y: event.clientY - offset.y });
  }

  function continueDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) {
      return;
    }

    setOffset({
      x: event.clientX - origin.x,
      y: event.clientY - origin.y,
    });
  }

  function endDrag() {
    setDragging(false);
  }

  function zoomIn() {
    setScale((prev) => Math.min(4, Number((prev + 0.2).toFixed(2))));
  }

  function zoomOut() {
    setScale((prev) => Math.max(0.4, Number((prev - 0.2).toFixed(2))));
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    setScale((prev) => {
      const next = event.deltaY > 0 ? prev - 0.08 : prev + 0.08;
      return Math.max(0.4, Math.min(4, Number(next.toFixed(2))));
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={zoomOut}
          className="rounded-full border border-line bg-white/85 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-white"
        >
          Zoom -
        </button>
        <button
          type="button"
          onClick={zoomIn}
          className="rounded-full border border-line bg-white/85 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-white"
        >
          Zoom +
        </button>
        <button
          type="button"
          onClick={resetControls}
          className="rounded-full border border-line bg-white/85 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-white"
        >
          Reset view
        </button>
        <p className="text-xs text-muted">Scale {Math.round(scale * 100)}%</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Brightness
          </span>
          <input
            type="range"
            min={50}
            max={180}
            value={brightness}
            onChange={(event) => setBrightness(Number(event.target.value))}
            className="w-full"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Contrast
          </span>
          <input
            type="range"
            min={50}
            max={180}
            value={contrast}
            onChange={(event) => setContrast(Number(event.target.value))}
            className="w-full"
          />
        </label>
      </div>

      <div
        onPointerDown={startDrag}
        onPointerMove={continueDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        onWheel={handleWheel}
        className={`relative h-[28rem] overflow-hidden rounded-2xl border border-line bg-[#0f1916] ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {imageUrl ? (
          <Image
            alt="Study image"
            draggable={false}
            src={imageUrl}
            fill
            unoptimized
            sizes="100vw"
            style={imageStyle}
            className="absolute top-1/2 left-1/2 h-auto w-auto max-h-none max-w-none -translate-x-1/2 -translate-y-1/2 select-none"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-6">
            <p className="text-sm text-white/70">No image selected for viewing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
