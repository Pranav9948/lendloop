"use client";

import { useMutation } from "convex/react";
import { ImagePlus, Upload } from "lucide-react";
import { useEffect, useState } from "react";

import Image from "next/image";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface ToolImageUploaderProps {
  onUploadComplete: (storageId: Id<"_storage"> | null) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ToolImageUploader({
  onUploadComplete,
}: ToolImageUploaderProps) {
  const generateUploadUrl = useMutation(api.tools.generateToolImageUploadUrl);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setError(null);
    setIsUploaded(false);
    onUploadComplete(null);

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError("Please select a JPEG, PNG or WebP image.");
      setFile(null);
      setPreviewUrl(null);
      event.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("Image size must not exceed 5 MB.");
      setFile(null);
      setPreviewUrl(null);
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  }

  async function handleUpload() {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Step 1: Request a temporary upload URL from Convex.
      const uploadUrl = await generateUploadUrl({});

      // Step 2: Upload the selected image to Convex Storage.
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error("Image upload failed. Please try again.");
      }

      // Step 3: Receive the storage ID.
      const result = (await response.json()) as {
        storageId: Id<"_storage">;
      };

      if (!result.storageId) {
        throw new Error("Convex did not return an image storage ID.");
      }

      // Step 4: Send the storage ID to the parent form.
      onUploadComplete(result.storageId);
      setIsUploaded(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong during image upload.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="tool-image"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Tool Photograph
        </label>

        <label
          htmlFor="tool-image"
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:bg-gray-50"
        >
          <ImagePlus size={32} className="mb-2 text-muted" />

          <span className="text-sm font-medium text-foreground">
            Choose a tool photograph
          </span>

          <span className="mt-1 text-xs text-muted">
            JPEG, PNG or WebP · Maximum 5 MB
          </span>

          <input
            id="tool-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="sr-only"
          />
        </label>
      </div>


      {previewUrl && (
        <div className="overflow-hidden rounded-2xl border border-[#dfe8e1] bg-[#f7f9f6]">
          {/* Preview header */}
          <div className="flex items-center justify-between gap-3 border-b border-[#e5ebe5] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[#203b30]">
                Image preview
              </p>
              <p className="mt-0.5 text-xs text-[#829087]">
                Check how your photograph looks
              </p>
            </div>

            <label
              htmlFor="tool-image"
              className="cursor-pointer rounded-lg border border-[#dce8dd] bg-white px-3 py-2 text-xs font-semibold text-[#397653] transition hover:bg-[#edf4ee]"
            >
              Change photo
            </label>
          </div>

          {/* Fixed-size image preview */}
          <div className="relative h-48 w-full bg-white sm:h-56">
            <Image
              src={previewUrl}
              alt="Selected tool preview"
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, 600px"
              className="object-contain p-3"
            />
          </div>

          {/* File information */}
          <div className="flex items-center justify-between gap-3 border-t border-[#e5ebe5] px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-[#52675a]">
                {file?.name}
              </p>
              <p className="mt-1 text-[11px] text-[#89958c]">
                {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : ""}
              </p>
            </div>

            {isUploaded && (
              <span className="shrink-0 rounded-full bg-[#e6f3e9] px-2.5 py-1 text-[11px] font-semibold text-[#32744c]">
                Uploaded
              </span>
            )}
          </div>

          {/* Upload button */}
          <div className="border-t border-[#e5ebe5] p-3">
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || isUploading || isUploaded}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#203b30] px-4 text-sm font-semibold text-white transition hover:bg-[#294c3d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload size={16} />
              {isUploading
                ? "Uploading image..."
                : isUploaded
                  ? "Photograph uploaded"
                  : "Upload photograph"}
            </button>
          </div>
        </div>
      )}


      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {isUploaded && (
        <p className="text-sm text-green-700">
          Your photograph is uploaded and ready to attach to the tool listing.
        </p>
      )}
    </div>
  );
}
