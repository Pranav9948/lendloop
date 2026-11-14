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
        <div className="space-y-3 rounded-xl border border-border bg-gray-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">
              Image preview
            </p>
            <label
              htmlFor="tool-image"
              className="cursor-pointer text-xs font-medium text-primary hover:underline"
            >
              Change photo
            </label>
          </div>

          <div className="flex aspect-video max-h-64 items-center justify-center overflow-hidden rounded-lg border border-border bg-white">
            <Image
              src={previewUrl}
              alt="Selected tool preview"
              fill
              unoptimized
              className="object-contain"
            />
          </div>

          <p className="truncate text-xs text-muted">
            Selected: {file?.name}
          </p>

          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || isUploading || isUploaded}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload size={17} />

            {isUploading
              ? "Uploading image..."
              : isUploaded
                ? "Image uploaded successfully"
                : "Upload photograph"}
          </button>
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
