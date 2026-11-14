"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeading } from "@/components/shared/page-heading";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const categories = [
  { label: "All categories", value: "all" },
  { label: "Power Tools", value: "power_tools" },
  { label: "Garden", value: "garden" },
  { label: "Kitchen", value: "kitchen" },
  { label: "Camping", value: "camping" },
  { label: "Other", value: "other" },
] as const;

const categoryLabels: Record<string, string> = {
  power_tools: "Power Tools",
  garden: "Garden",
  kitchen: "Kitchen",
  camping: "Camping",
  other: "Other",
};

export default function AllToolsPage() {
  const [category, setCategory] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);


  const tools = useQuery(api.tools.getAllActiveTools, {
    category:
      category === "all"
        ? undefined
        : (category as
          "power_tools" | "garden" | "kitchen" | "camping" | "other"),
  });

  const createBorrowRequest = useMutation(
    api.borrowRequests.createBorrowRequest,
  );

  const [selectedToolId, setSelectedToolId] =
    useState<Id<"tools"> | null>(null);


  async function handleBorrowRequest(toolId: Id<"tools">) {
    if (!startDate || !endDate) {
      setActionError("Please select both borrowing dates.");
      return;
    }

    const startTimestamp = new Date(`${startDate}T00:00:00`).getTime();
    const endTimestamp = new Date(`${endDate}T00:00:00`).getTime();

    if (startTimestamp <= new Date().setHours(0, 0, 0, 0)) {
      setActionError("Please select a future start date.");
      return;
    }

    if (endTimestamp <= startTimestamp) {
      setActionError("End date must be after start date.");
      return;
    }

    setBusy(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await createBorrowRequest({
        toolId,
        startDate: startTimestamp,
        endDate: endTimestamp,
      });

      setActionSuccess("Borrow request submitted successfully.");
      setSelectedToolId(null);
      setStartDate("");
      setEndDate("");
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to submit your borrow request.",
      );
    } finally {
      setBusy(false);
    }
  }



  return (
    <div>
      <PageHeading
        title="All Tools"
        description="Explore tools shared by your community."
      />

      {actionError && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </p>
      )}

      {actionSuccess && (
        <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {actionSuccess}
        </p>
      )}

      <SectionCard title="Community Tools">
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setCategory(item.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${category === item.value
                ? "bg-primary text-white"
                : "bg-gray-100 text-muted hover:bg-gray-200"
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tools === undefined ? (
          <LoadingState message="Loading community tools..." />
        ) : tools.length === 0 ? (
          <EmptyState
            title="No tools found"
            description="There are no active tools in this category yet."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {tools.map((tool) => (
              <article
                key={tool._id}
                className="rounded-xl border border-border p-5"
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
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-foreground">{tool.name}</h3>
                  <StatusBadge status={tool.status} />
                </div>

                <p className="mt-2 text-xs font-medium text-primary">
                  {categoryLabels[tool.category]}
                </p>

                <p className="mt-3 text-sm text-muted">{tool.description}</p>

                <p className="mt-4 text-xs text-muted">
                  Condition: {tool.condition.replaceAll("_", " ")}
                </p>

                <div className="mt-5 border-t border-border pt-4">
                  {selectedToolId !== tool._id ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedToolId(tool._id);
                        setActionError(null);
                        setActionSuccess(null);
                      }}
                      className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
                    >
                      Request to Borrow
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground">
                        Select borrowing dates
                      </h4>

                      <div>
                        <label className="mb-1 block text-xs text-muted">
                          Start date
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          min={new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString("en-CA")}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs text-muted">
                          End date
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          min={startDate || undefined}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleBorrowRequest(tool._id)}
                          className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
                        >
                          {busy ? "Submitting..." : "Submit Request"}
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            setSelectedToolId(null);
                            setStartDate("");
                            setEndDate("");
                            setActionError(null);
                          }}
                          className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
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
