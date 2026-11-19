"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  X,
  Star,
  ArrowUp,
  ArrowDown,
  Loader2,
  AlertCircle,
  Camera,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface UploadedImageItem {
  id?: string;
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

interface ImageUploaderProps {
  images: UploadedImageItem[];
  onChange: (images: UploadedImageItem[]) => void;
  maxImages?: number;
  productId?: string;
  disabled?: boolean;
}

export function ImageUploader({
  images,
  onChange,
  maxImages = 8,
  productId,
  disabled = false,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [deletedBackup, setDeletedBackup] = useState<{ item: UploadedImageItem; index: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFiles = async (files: FileList | File[]) => {
    if (disabled || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      const err = `Maximum ${maxImages} images allowed. Please select fewer images.`;
      setUploadError(err);
      toast.error(err);
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(10);

    const newUploadedItems: UploadedImageItem[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Client-side quick check
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds 5MB limit. Please choose a smaller photo.`);
        }

        const formData = new FormData();
        formData.append("file", file);
        if (productId) formData.append("productId", productId);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.url) {
          throw new Error(data.error || `Failed to upload "${file.name}".`);
        }

        newUploadedItems.push({
          url: data.url,
          alt: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
          isPrimary: images.length === 0 && newUploadedItems.length === 0,
        });

        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      const updated = [...images, ...newUploadedItems];
      // Ensure at least one primary
      if (!updated.some((img) => img.isPrimary) && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      onChange(updated);
      toast.success(
        files.length === 1
          ? "Toy photo uploaded successfully!"
          : `${files.length} toy photos uploaded successfully!`
      );
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image.");
      toast.error(err.message || "Upload failed.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (index: number) => {
    const itemToRemove = images[index];
    const next = images.filter((_, i) => i !== index);
    if (itemToRemove.isPrimary && next.length > 0) {
      next[0].isPrimary = true;
    }
    setDeletedBackup({ item: itemToRemove, index });
    onChange(next);

    toast("Photo removed", {
      action: {
        label: "Undo",
        onClick: () => {
          const restored = [...next];
          restored.splice(index, 0, itemToRemove);
          onChange(restored);
          setDeletedBackup(null);
        },
      },
    });
  };

  const handleSetPrimary = (index: number) => {
    const next = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(next);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const next = [...images];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    onChange(next);
  };

  const handleAltChange = (index: number, alt: string) => {
    const next = [...images];
    next[index] = { ...next[index], alt };
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.dataTransfer.files) {
            handleUploadFiles(e.dataTransfer.files);
          }
        }}
        className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all ${
          disabled
            ? "opacity-60 cursor-not-allowed bg-[var(--surface-container-lowest)] border-[var(--border)]"
            : "hover:border-[var(--primary)] bg-[var(--surface-container-low)] border-[var(--border)] cursor-pointer"
        }`}
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          disabled={disabled || isUploading}
          onChange={(e) => e.target.files && handleUploadFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shadow-xs">
            {isUploading ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <Upload className="w-7 h-7" />
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-bold text-[var(--text-primary)]">
              {isUploading ? "Uploading photos..." : "Click or drag toy photos here"}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              JPEG, PNG, or WebP up to 5MB. Maximum {maxImages} photos per product.
            </p>
          </div>

          {!disabled && !isUploading && (
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-1.5 text-xs font-bold"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Browse Gallery</span>
              </Button>
            </div>
          )}

          {isUploading && uploadProgress > 0 && (
            <div className="w-full max-w-xs bg-[var(--border)] rounded-full h-2 overflow-hidden mt-2">
              <div
                className="bg-[var(--primary)] h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Image Gallery List */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-muted)] px-1">
            <span>Product Gallery ({images.length} / {maxImages})</span>
            <span>⭐ Star marks the primary catalog photo</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {images.map((item, index) => (
              <div
                key={item.url + index}
                className={`group relative rounded-2xl border p-2.5 bg-[var(--surface)] shadow-xs transition-all flex flex-col justify-between ${
                  item.isPrimary
                    ? "border-amber-500 ring-2 ring-amber-500/20"
                    : "border-[var(--border)] hover:border-[var(--primary)]/50"
                }`}
              >
                {/* Photo Preview */}
                <div className="relative w-full h-36 rounded-xl overflow-hidden bg-[var(--surface-container-low)] mb-2.5">
                  <Image
                    src={item.url}
                    alt={item.alt || `Photo ${index + 1}`}
                    fill
                    className="object-contain p-1"
                    sizes="200px"
                  />

                  {/* Primary Badge */}
                  {item.isPrimary && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-500 text-slate-950 flex items-center gap-1 shadow-xs">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      Primary
                    </span>
                  )}

                  {/* Delete Button */}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Alt Text Input */}
                <div className="space-y-2">
                  <input
                    type="text"
                    value={item.alt || ""}
                    onChange={(e) => handleAltChange(index, e.target.value)}
                    placeholder="Photo description (Alt text)"
                    disabled={disabled}
                    className="w-full px-2.5 py-1 text-[11px] rounded-lg border border-[var(--border)] bg-[var(--surface-container-lowest)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                  />

                  {/* Controls Toolbar */}
                  <div className="flex items-center justify-between pt-1 border-t border-[var(--border)]">
                    {!item.isPrimary && !disabled ? (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(index)}
                        className="text-[10px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1 cursor-pointer"
                      >
                        <Star className="w-3 h-3" />
                        <span>Set Main</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                        Main Photo
                      </span>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0 || disabled}
                        onClick={() => handleMove(index, "up")}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                        title="Move Left"
                      >
                        <ArrowUp className="w-3 h-3 rotate-[-90deg]" />
                      </button>
                      <button
                        type="button"
                        disabled={index === images.length - 1 || disabled}
                        onClick={() => handleMove(index, "down")}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                        title="Move Right"
                      >
                        <ArrowDown className="w-3 h-3 rotate-[-90deg]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
