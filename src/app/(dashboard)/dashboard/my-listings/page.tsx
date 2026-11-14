
"use client";

import { useMutation, useQuery } from "convex/react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeading } from "@/components/shared/page-heading";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { CreateToolForm } from "@/components/tools/create-tool-form";
import { EditToolForm } from "@/components/tools/edit-tool-form";
import Image from "next/image";

import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

const categoryLabels: Record<string, string> = {
  power_tools: "Power Tools",
  garden: "Garden",
  kitchen: "Kitchen",
  camping: "Camping",
  other: "Other",
};

export default function MyListingsPage() {
  const tools = useQuery(api.tools.getMyListings, {});
  const deleteTool = useMutation(api.tools.deleteTool);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingToolId, setEditingToolId] =
    useState<Id<"tools"> | null>(null);
  const [busyToolId, setBusyToolId] =
    useState<Id<"tools"> | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleDelete(toolId: Id<"tools">, toolName: string) {
    const confirmed = window.confirm(
      `Remove "${toolName}" from community listings? It will be archived and won't appear in active tool browsing.`,
    );

    if (!confirmed) return;

    setBusyToolId(toolId);
    setActionError(null);

    try {
      await deleteTool({ toolId });
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to archive this listing.",
      );
    } finally {
      setBusyToolId(null);
    }
  }

  const editingTool = tools?.find(
    (tool) => tool._id === editingToolId,
  );

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeading
          title="My Listings"
          description="Manage the tools you have shared with your community."
        />

        <button
          type="button"
          onClick={() => {
            setShowCreateForm((current) => !current);
            setEditingToolId(null);
          }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
        >
          {showCreateForm ? <X size={17} /> : <Plus size={17} />}
          {showCreateForm ? "Close Form" : "Add a Tool"}
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-8">
          <SectionCard
            title="Create a Tool Listing"
            description="Provide the tool details and upload a photograph."
          >
            <CreateToolForm
              onCreated={() => setShowCreateForm(false)}
              onCancel={() => setShowCreateForm(false)}
            />
          </SectionCard>
        </div>
      )}

      {editingTool && (
        <div className="mb-8">
          <SectionCard
            title={`Edit ${editingTool.name}`}
            description="Update the tool details or replace its photograph."
          >
            <EditToolForm
              tool={editingTool}
              onUpdated={() => setEditingToolId(null)}
              onCancel={() => setEditingToolId(null)}
            />
          </SectionCard>
        </div>
      )}

      {actionError && (
        <p
          role="alert"
          className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {actionError}
        </p>
      )}

      <SectionCard
        title="Your Listings"
        description="Tools registered under your account."
      >
        {tools === undefined ? (
          <LoadingState message="Loading your listings..." />
        ) : tools.length === 0 ? (
          <EmptyState
            title="You haven't listed any tools yet"
            description="Your tools will appear here after you create your first listing."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {tools.map((tool) => (
              <article
                key={tool._id}
                className="overflow-hidden rounded-xl border border-border"
              >
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-gray-50">
                  {tool.imageUrl ? (
                    <Image
                      src={tool.imageUrl}
                      alt={tool.name}
                      width={600}
                      height={450}
                      unoptimized
                      className="h-full w-full object-contain p-3"
                    />
                  ) : (
                    <div className="text-sm text-muted">
                      No photograph available
                    </div>
                  )}
                </div>

                <div className="flex items-start justify-between gap-3 p-5 pb-0">
                  <h3 className="font-semibold text-foreground">
                    {tool.name}
                  </h3>
                  <StatusBadge status={tool.status} />
                </div>

                <p className="px-5 pt-2 text-xs font-medium text-primary">
                  {categoryLabels[tool.category]}
                </p>

                <p className="px-5 pt-3 text-sm text-muted">
                  {tool.description}
                </p>

                <div className="mt-4 border-t border-border px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs capitalize text-muted">
                      Condition: {tool.condition.replaceAll("_", " ")}
                    </span>

                    <span className="text-xs text-muted">
                      Updated: {new Date(tool.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {tool.status === "active" ? (
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setEditingToolId(tool._id);
                        }}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-gray-50"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={busyToolId !== null}
                        onClick={() => handleDelete(tool._id, tool.name)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                        {busyToolId === tool._id
                          ? "Removing..."
                          : "Delete"}
                      </button>
                    </div>
                  ) : (
                    <p className="mt-4 text-xs text-muted">
                      This listing is archived and no longer available for editing.
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
