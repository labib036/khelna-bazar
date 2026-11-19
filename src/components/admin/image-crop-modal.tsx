"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Crop,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Check,
  X,
  Upload,
  Sparkles,
  Eye,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CropResult {
  file: File;
  previewUrl: string;
}

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Initial image file or URL */
  imageSource?: File | string | null;
  /** Called when the user clicks 'Apply & Save' */
  onApply: (result: CropResult) => void;
  title?: string;
  defaultAspectRatio?: "1:1" | "4:3" | "16:9" | "free";
}

type AspectRatio = "1:1" | "4:3" | "16:9" | "free";

export function ImageCropModal({
  isOpen,
  onClose,
  imageSource,
  onApply,
  title = "Toy Photo Studio — Crop & Scale",
  defaultAspectRatio = "1:1",
}: ImageCropModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>("toy-photo.jpg");
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Transforms
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(defaultAspectRatio);

  // Pan Offset (image position inside container)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Crop Box normalized [0..1]
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0.1,
    y: 0.1,
    width: 0.8,
    height: 0.8,
  });

  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; box: typeof cropBox }>({
    mouseX: 0,
    mouseY: 0,
    box: { x: 0, y: 0, width: 0, height: 0 },
  });

  // Canvas Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [previewDims, setPreviewDims] = useState<{ width: number; height: number }>({ width: 600, height: 600 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load image when imageSource changes
  useEffect(() => {
    if (!imageSource) {
      setImageSrc(null);
      return;
    }

    if (imageSource instanceof File) {
      setOriginalFileName(imageSource.name);
      const url = URL.createObjectURL(imageSource);
      setImageSrc(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof imageSource === "string") {
      setImageSrc(imageSource);
      setOriginalFileName("toy-catalog-photo.jpg");
    }
  }, [imageSource]);

  // Load image element and set natural dimensions
  const handleImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    imageRef.current = img;
    setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    resetCropBox(aspectRatio, img.naturalWidth, img.naturalHeight);
  };

  // Reset Crop Box to match aspect ratio
  const resetCropBox = useCallback((ratio: AspectRatio, naturalW?: number, naturalH?: number) => {
    const w = naturalW || imageSize.width || 1;
    const h = naturalH || imageSize.height || 1;

    let targetRatio = 1;
    if (ratio === "1:1") targetRatio = 1;
    else if (ratio === "4:3") targetRatio = 4 / 3;
    else if (ratio === "16:9") targetRatio = 16 / 9;
    else {
      // free
      setCropBox({ x: 0.05, y: 0.05, width: 0.9, height: 0.9 });
      return;
    }

    const imgAspect = w / h;
    let boxW = 0.8;
    let boxH = 0.8;

    if (imgAspect > targetRatio) {
      // Image is wider than target crop
      boxH = 0.8;
      boxW = (boxH * targetRatio) / imgAspect;
    } else {
      // Image is taller than target crop
      boxW = 0.8;
      boxH = (boxW / targetRatio) * imgAspect;
    }

    const boxX = Math.max(0, (1 - boxW) / 2);
    const boxY = Math.max(0, (1 - boxH) / 2);

    setCropBox({
      x: boxX,
      y: boxY,
      width: Math.min(1 - boxX, boxW),
      height: Math.min(1 - boxY, boxH),
    });
  }, [imageSize]);

  // Handle changing aspect ratio
  const handleRatioChange = (ratio: AspectRatio) => {
    setAspectRatio(ratio);
    resetCropBox(ratio);
  };

  // Reset all adjustments
  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setPan({ x: 0, y: 0 });
    resetCropBox(aspectRatio);
  };

  // File Picker for choosing another photo from PC inside modal
  const handleLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalFileName(file.name);
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      handleReset();
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    setScale((prev) => Math.min(3, Math.max(0.5, +(prev + delta).toFixed(2))));
  };

  // Pan & Crop Mouse Events
  const handleMouseDown = (e: React.MouseEvent, handle?: string) => {
    e.preventDefault();
    if (handle) {
      setActiveHandle(handle);
      dragStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        box: { ...cropBox },
      };
    } else {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
      return;
    }

    if (!activeHandle || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const dx = (e.clientX - dragStartRef.current.mouseX) / rect.width;
    const dy = (e.clientY - dragStartRef.current.mouseY) / rect.height;

    const b = dragStartRef.current.box;
    let next = { ...cropBox };

    const minSize = 0.15; // minimum 15% of container

    if (activeHandle === "move") {
      next.x = Math.max(0, Math.min(1 - b.width, b.x + dx));
      next.y = Math.max(0, Math.min(1 - b.height, b.y + dy));
    } else if (activeHandle === "se") {
      const nw = Math.max(minSize, Math.min(1 - b.x, b.width + dx));
      const nh = aspectRatio === "1:1" ? nw : aspectRatio === "4:3" ? nw * 0.75 : aspectRatio === "16:9" ? nw * (9 / 16) : Math.max(minSize, Math.min(1 - b.y, b.height + dy));
      next.width = nw;
      next.height = Math.min(1 - b.y, nh);
    } else if (activeHandle === "nw") {
      const nx = Math.max(0, Math.min(b.x + b.width - minSize, b.x + dx));
      const ny = Math.max(0, Math.min(b.y + b.height - minSize, b.y + dy));
      next.width = b.x + b.width - nx;
      next.height = b.y + b.height - ny;
      next.x = nx;
      next.y = ny;
    } else if (activeHandle === "ne") {
      const ny = Math.max(0, Math.min(b.y + b.height - minSize, b.y + dy));
      next.width = Math.max(minSize, Math.min(1 - b.x, b.width + dx));
      next.height = b.y + b.height - ny;
      next.y = ny;
    } else if (activeHandle === "sw") {
      const nx = Math.max(0, Math.min(b.x + b.width - minSize, b.x + dx));
      next.width = b.x + b.width - nx;
      next.height = Math.max(minSize, Math.min(1 - b.y, b.height + dy));
      next.x = nx;
    }

    setCropBox(next);
  };

  const handleMouseUp = () => {
    setActiveHandle(null);
    setIsPanning(false);
  };

  // Render Real-time Cropped Preview
  const updatePreviewCanvas = useCallback(() => {
    const canvas = previewCanvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate crop rectangle in natural image coordinates
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;

    const cropX = Math.max(0, Math.min(natW, cropBox.x * natW));
    const cropY = Math.max(0, Math.min(natH, cropBox.y * natH));
    const cropW = Math.max(10, Math.min(natW - cropX, cropBox.width * natW));
    const cropH = Math.max(10, Math.min(natH - cropY, cropBox.height * natH));

    // Desired output size (high res 800px standard for toy cards)
    const outWidth = Math.min(1200, Math.max(400, Math.round(cropW * scale)));
    const outHeight = Math.min(1200, Math.max(400, Math.round(cropH * scale)));

    canvas.width = outWidth;
    canvas.height = outHeight;
    setPreviewDims({ width: outWidth, height: outHeight });

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Clean background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, outWidth, outHeight);

    // Apply rotation and flip around canvas center
    ctx.translate(outWidth / 2, outHeight / 2);
    if (rotation !== 0) ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Draw the cropped portion
    ctx.drawImage(
      img,
      cropX,
      cropY,
      cropW,
      cropH,
      -outWidth / 2,
      -outHeight / 2,
      outWidth,
      outHeight
    );

    ctx.restore();
  }, [cropBox, scale, rotation, flipH, flipV]);

  useEffect(() => {
    updatePreviewCanvas();
  }, [updatePreviewCanvas]);

  // Apply & Generate Cropped File
  const handleApply = async () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const cleanName = originalFileName.replace(/\.[^/.]+$/, "") + "-cropped.webp";
        const file = new File([blob], cleanName, { type: "image/webp" });
        const previewUrl = URL.createObjectURL(blob);
        onApply({ file, previewUrl });
        onClose();
      },
      "image/webp",
      0.92
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl bg-[var(--surface)] text-[var(--text-primary)] rounded-3xl border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-container-low)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shadow-xs">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black font-heading leading-tight flex items-center gap-2">
                <span>{title}</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  PC Studio
                </span>
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Interactive crop, zoom &amp; scale with instant e-commerce preview
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--surface-container-high)] hover:bg-rose-500/10 hover:text-rose-600 text-[var(--text-muted)] flex items-center justify-center transition-colors cursor-pointer"
            title="Close Studio"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Studio Workspace */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)]">
          {/* Main Cropper Stage (Left 8 Cols) */}
          <div className="lg:col-span-8 p-4 sm:p-6 flex flex-col justify-between space-y-4 bg-slate-950/5 dark:bg-black/20">
            {/* Visual Canvas Area */}
            <div
              ref={containerRef}
              onWheel={handleWheel}
              onMouseDown={(e) => handleMouseDown(e)}
              className="relative w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center select-none cursor-grab active:cursor-grabbing border border-slate-700/50 shadow-inner"
            >
              {imageSrc ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageSrc}
                    alt="Toy Preview"
                    onLoad={handleImageLoaded}
                    crossOrigin="anonymous"
                    draggable={false}
                    className="max-w-none transition-transform duration-75 pointer-events-none"
                    style={{
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale}) rotate(${rotation}deg) scaleX(${
                        flipH ? -1 : 1
                      }) scaleY(${flipV ? -1 : 1})`,
                      maxHeight: "90%",
                      maxWidth: "90%",
                      objectFit: "contain",
                    }}
                  />

                  {/* Dark Mask Outside Crop Box */}
                  <div className="absolute inset-0 pointer-events-none">
                    <svg className="w-full h-full">
                      <defs>
                        <mask id="crop-mask">
                          <rect width="100%" height="100%" fill="white" />
                          <rect
                            x={`${cropBox.x * 100}%`}
                            y={`${cropBox.y * 100}%`}
                            width={`${cropBox.width * 100}%`}
                            height={`${cropBox.height * 100}%`}
                            fill="black"
                            rx="4"
                          />
                        </mask>
                      </defs>
                      <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.65)" mask="url(#crop-mask)" />
                    </svg>
                  </div>

                  {/* Interactive Crop Frame */}
                  <div
                    style={{
                      left: `${cropBox.x * 100}%`,
                      top: `${cropBox.y * 100}%`,
                      width: `${cropBox.width * 100}%`,
                      height: `${cropBox.height * 100}%`,
                    }}
                    className="absolute border-2 border-[var(--primary)] shadow-2xl pointer-events-auto cursor-move flex flex-col justify-between"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleMouseDown(e, "move");
                    }}
                  >
                    {/* Rule of Thirds Grid Guidelines */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                      <div className="border-r border-b border-white/60" />
                      <div className="border-r border-b border-white/60" />
                      <div className="border-b border-white/60" />
                      <div className="border-r border-b border-white/60" />
                      <div className="border-r border-b border-white/60" />
                      <div className="border-b border-white/60" />
                      <div className="border-r border-white/60" />
                      <div className="border-r border-white/60" />
                      <div />
                    </div>

                    {/* Resize Corner Handles */}
                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, "nw");
                      }}
                      className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-[var(--primary)] rounded-full shadow-md cursor-nwse-resize z-20"
                    />
                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, "ne");
                      }}
                      className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-[var(--primary)] rounded-full shadow-md cursor-nesw-resize z-20"
                    />
                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, "sw");
                      }}
                      className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-[var(--primary)] rounded-full shadow-md cursor-nesw-resize z-20"
                    />
                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, "se");
                      }}
                      className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-[var(--primary)] rounded-full shadow-md cursor-nwse-resize z-20"
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 text-white flex items-center justify-center">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">No Toy Picture Loaded</p>
                    <p className="text-xs text-slate-400">Select a toy photo from your PC to crop and scale</p>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2 font-bold"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Choose Photo from PC</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Toolbar below Canvas */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {/* Zoom / Scale Control */}
              <div className="flex items-center gap-2 bg-[var(--surface)] px-3 py-1.5 rounded-2xl border border-[var(--border)] shadow-xs">
                <ZoomOut className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-24 sm:w-32 accent-[var(--primary)] h-1.5 bg-[var(--border)] rounded-lg cursor-pointer"
                />
                <ZoomIn className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="text-xs font-mono font-bold w-12 text-right">
                  {Math.round(scale * 100)}%
                </span>
              </div>

              {/* Transform Buttons */}
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                  title="Rotate Counter-Clockwise (-90°)"
                  className="h-8 w-8 p-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  title="Rotate Clockwise (+90°)"
                  className="h-8 w-8 p-0"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFlipH((f) => !f)}
                  title="Flip Horizontal"
                  className={`h-8 w-8 p-0 ${flipH ? "bg-[var(--primary)]/10 text-[var(--primary)]" : ""}`}
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFlipV((f) => !f)}
                  title="Flip Vertical"
                  className={`h-8 w-8 p-0 ${flipV ? "bg-[var(--primary)]/10 text-[var(--primary)]" : ""}`}
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  title="Reset Scale and Crop"
                  className="h-8 w-8 p-0 text-slate-500"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* PC Image Replace Trigger */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleLocalFileSelect}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-1.5 text-xs font-bold"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Replace from PC</span>
              </Button>
            </div>
          </div>

          {/* Right Sidebar Controls & Real-Time Preview (Right 4 Cols) */}
          <div className="lg:col-span-4 p-5 sm:p-6 space-y-6 flex flex-col justify-between bg-[var(--surface)]">
            <div className="space-y-5">
              {/* Aspect Ratio Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[var(--primary)]" />
                  <span>Toy Crop Aspect Ratio</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-[var(--surface-container-low)] rounded-xl border border-[var(--border)]">
                  {(["1:1", "4:3", "16:9", "free"] as AspectRatio[]).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => handleRatioChange(ratio)}
                      className={`py-1.5 text-xs font-extrabold rounded-lg transition-all capitalize cursor-pointer ${
                        aspectRatio === ratio
                          ? "bg-[var(--primary)] text-white shadow-xs"
                          : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {ratio === "1:1" ? "1:1 🛍️" : ratio}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  <strong>1:1 Square</strong> is recommended for catalog cards &amp; mobile shopping.
                </p>
              </div>

              {/* Live Card Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)]">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Live Storefront Preview</span>
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    {previewDims.width} × {previewDims.height}px
                  </span>
                </div>

                {/* Simulated E-commerce Toy Card Frame */}
                <div className="p-3 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--border)] shadow-xs space-y-2">
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white border border-slate-200/80 dark:border-slate-800 flex items-center justify-center shadow-inner">
                    <canvas
                      ref={previewCanvasRef}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-muted)] px-1">
                    <span className="truncate max-w-[140px]">{originalFileName}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Ready
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-[var(--border)] flex items-center justify-end gap-2.5">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleApply}
                disabled={!imageSrc}
                className="gap-2 font-bold shadow-xs px-5"
              >
                <Check className="w-4 h-4" />
                <span>Apply &amp; Add Picture</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
