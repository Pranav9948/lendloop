"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { ToolImageUploader } from "./tool-image-uploader";

interface CreateToolFormProps {
  onCreated: () => void;
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

export function CreateToolForm({ onCreated, onCancel }: CreateToolFormProps) {
  const createTool = useMutation(api.tools.createTool);

  const [name, setName] = useState("");
  const [category, setCategory] =
    useState<(typeof categories)[number]["value"]>("other");
  const [condition, setCondition] =
    useState<(typeof conditions)[number]["value"]>("good");
  const [description, setDescription] = useState("");
  const [imageId, setImageId] = useState<Id<"_storage"> | null>(null);
  const [uploaderKey] = useState(0);
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

    if (trimmedDescription.length < 10 || trimmedDescription.length > 500) {
      setError("Description must be between 10 and 500 characters.");
      return;
    }

    if (!imageId) {
      setError("Please upload a photograph of your tool.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createTool({
        name: trimmedName,
        category,
        condition,
        description: trimmedDescription,
        imageId,
      });

      onCreated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create the tool listing. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="tool-name"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Tool name
        </label>
        <input
          id="tool-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={80}
          required
          placeholder="e.g. Cordless Power Drill"
          className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="tool-category"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Category
          </label>
          <select
            id="tool-category"
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
            htmlFor="tool-condition"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Condition
          </label>
          <select
            id="tool-condition"
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
          htmlFor="tool-description"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Description
        </label>
        <textarea
          id="tool-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          minLength={10}
          maxLength={500}
          required
          rows={4}
          placeholder="Describe the tool and what it can be used for..."
          className="w-full resize-y rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
        <p className="mt-1 text-right text-xs text-muted">
          {description.length}/500 characters
        </p>
      </div>

      <ToolImageUploader key={uploaderKey} onUploadComplete={setImageId} />

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
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting || !imageId}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Creating listing..." : "Create Listing"}
        </button>
      </div>
    </form>
  );
}
