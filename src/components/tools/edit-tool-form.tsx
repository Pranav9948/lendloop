
"use client";

import { useMutation } from "convex/react";
import { useState } from "react";

import { Package } from "lucide-react";
import Image from "next/image";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { ToolImageUploader } from "./tool-image-uploader";

interface EditToolFormProps {
  tool: {
    _id: Id<"tools">;
    name: string;
    category: "power_tools" | "garden" | "kitchen" | "camping" | "other";
    condition: "new" | "good" | "fair" | "needs_repair";
    description: string;
    imageUrl: string | null;
  };
  onUpdated: () => void;
  onCancel: () => void;
}

const categories = [
  { value: "power_tools", label: "Power Tools" },
  { value: "garden", label: "Garden" },
  { value: "kitchen", label: "Kitchen" },
  { value: "camping", label: "Camping" },
  { value: "other", label: "Other" },
] as const;

const conditions = [
  { value: "new", label: "New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "needs_repair", label: "Needs Repair" },
] as const;

export function EditToolForm({
  tool,
  onUpdated,
  onCancel,
}: EditToolFormProps) {
  const updateTool = useMutation(api.tools.updateTool);

  const [name, setName] = useState(tool.name);
  const [category, setCategory] = useState(tool.category);
  const [condition, setCondition] = useState(tool.condition);
  const [description, setDescription] = useState(tool.description);
  const [newImageId, setNewImageId] = useState<Id<"_storage"> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (trimmedName.length < 2 || trimmedName.length > 80) {
      setError("Tool name must be between 2 and 80 characters.");
      return;
    }

    if (
      trimmedDescription.length < 10 ||
      trimmedDescription.length > 500
    ) {
      setError("Description must be between 10 and 500 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateTool({
        toolId: tool._id,
        name: trimmedName,
        category,
        condition,
        description: trimmedDescription,
        ...(newImageId ? { imageId: newImageId } : {}),
      });

      onUpdated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update this listing.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="edit-tool-name"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Tool name
        </label>
        <input
          id="edit-tool-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={80}
          required
          className="w-full rounded-lg border border-border px-3 py-2.5 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="edit-tool-category"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Category
          </label>
          <select
            id="edit-tool-category"
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value as (typeof categories)[number]["value"],
              )
            }
            className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm"
          >
            {categories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="edit-tool-condition"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Condition
          </label>
          <select
            id="edit-tool-condition"
            value={condition}
            onChange={(event) =>
              setCondition(
                event.target.value as (typeof conditions)[number]["value"],
              )
            }
            className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm"
          >
            {conditions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="edit-tool-description"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Description
        </label>
        <textarea
          id="edit-tool-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          minLength={10}
          maxLength={500}
          required
          rows={4}
          className="w-full resize-y rounded-lg border border-border px-3 py-2.5 text-sm"
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">
          Current photograph
        </p>

        <div className="overflow-hidden rounded-xl border border-[#e5ebe5] bg-[#f7f8f5]">
          {tool.imageUrl ? (
            <div className="relative flex h-44 w-full items-center justify-center p-4">
              <Image
                src={tool.imageUrl}
                alt={tool.name}
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, 400px"
                className="object-contain p-4"
              />
            </div>
          ) : (
            <div className="flex h-44 flex-col items-center justify-center gap-2 text-[#89958c]">
              <Package size={28} />
              <span className="text-xs">No photograph available</span>
            </div>
          )}
        </div>

        <p className="text-sm font-medium text-foreground">
          Replace photograph (optional)
        </p>

        <ToolImageUploader onUploadComplete={setNewImageId} />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? "Saving changes..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
