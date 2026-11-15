
"use client";

import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import {
  Archive,
  Package,
  RotateCcw,
  Search,
} from "lucide-react";
import { useState } from "react";

import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeading } from "@/components/shared/page-heading";
import { StatusBadge } from "@/components/shared/status-badge";

const categories = [
  { label: "All categories", value: "" },
  { label: "Power tools", value: "power_tools" },
  { label: "Garden", value: "garden" },
  { label: "Kitchen", value: "kitchen" },
  { label: "Camping", value: "camping" },
  { label: "Other", value: "other" },
] as const;

const conditions = [
  { label: "All conditions", value: "" },
  { label: "New", value: "new" },
  { label: "Good", value: "good" },
  { label: "Fair", value: "fair" },
  { label: "Needs repair", value: "needs_repair" },
] as const;

const statuses = [
  { label: "All statuses", value: "" },
  { label: "Active", value: "active" },
  { label: "Archived", value: "archived" },
] as const;

export default function AdminToolsPage() {
  const profile = useQuery(api.users.getCurrentUserProfile);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [status, setStatus] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [busyToolId, setBusyToolId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  if (profile === undefined) {
    return <LoadingState message="Loading admin profile..." />;
  }

  if (!profile || profile.role !== "admin") {
    return (
      <ErrorState
        title="Access denied"
        description="You do not have permission to manage tool listings."
      />
    );
  }

  return (
    <ToolsTable
      key={`${pageSize}-${category}-${condition}-${status}`}
      search={search}
      setSearch={setSearch}
      category={category}
      setCategory={setCategory}
      condition={condition}
      setCondition={setCondition}
      status={status}
      setStatus={setStatus}
      pageSize={pageSize}
      setPageSize={setPageSize}
      busyToolId={busyToolId}
      setBusyToolId={setBusyToolId}
      actionMessage={actionMessage}
      setActionMessage={setActionMessage}
      actionError={actionError}
      setActionError={setActionError}
    />
  );
}

function ToolsTable({
  search,
  setSearch,
  category,
  setCategory,
  condition,
  setCondition,
  status,
  setStatus,
  pageSize,
  setPageSize,
  busyToolId,
  setBusyToolId,
  actionMessage,
  setActionMessage,
  actionError,
  setActionError,
}: {
  search: string;
  setSearch: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  condition: string;
  setCondition: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  pageSize: number;
  setPageSize: (value: number) => void;
  busyToolId: string | null;
  setBusyToolId: (value: string | null) => void;
  actionMessage: string;
  setActionMessage: (value: string) => void;
  actionError: string;
  setActionError: (value: string) => void;
}) {
  const { results, status: paginationStatus, loadMore } =
    usePaginatedQuery(
      api.admin.getPaginatedTools,
      {
        search: search.trim() || undefined,
        category: category
          ? (category as
            | "power_tools"
            | "garden"
            | "kitchen"
            | "camping"
            | "other")
          : undefined,
        condition: condition
          ? (condition as "new" | "good" | "fair" | "needs_repair")
          : undefined,
        status: status
          ? (status as "active" | "archived")
          : undefined,
      },
      { initialNumItems: pageSize },
    );

  const removeAnyTool = useMutation(api.admin.removeAnyTool);

  async function handleArchive(toolId: Id<"tools">) {
    const confirmed = window.confirm(
      "Are you sure you want to archive this listing? It will no longer be available to borrow.",
    );

    if (!confirmed) return;

    setBusyToolId(toolId);
    setActionMessage("");
    setActionError("");

    try {
      await removeAnyTool({ toolId });
      setActionMessage("Tool listing archived successfully.");
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

  const isLoading = paginationStatus === "LoadingFirstPage";

  return (
    <div className="space-y-6">
      <PageHeading
        title="All Tools"
        description="Review and manage every tool listing across the LendLoop platform."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted">Matching listings</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {results.length}
          </p>
          <p className="mt-1 text-xs text-muted">
            Loaded records for current filters
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted">Active in results</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {results.filter((tool) => tool.status === "active").length}
          </p>
          <p className="mt-1 text-xs text-muted">
            Currently active loaded listings
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted">Archived in results</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {results.filter((tool) => tool.status === "archived").length}
          </p>
          <p className="mt-1 text-xs text-muted">
            Archived loaded listings
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="font-semibold text-foreground">
                Tool listings
              </h2>
              <p className="mt-1 text-sm text-muted">
                Search, filter and manage community listings.
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tools..."
                className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary sm:max-w-md"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                {categories.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <select
                value={condition}
                onChange={(event) => setCondition(event.target.value)}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                {conditions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                {statuses.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <select
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("");
                  setCondition("");
                  setStatus("");
                }}
                className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4" />
                Clear filters
              </button>
            </div>
          </div>
        </div>

        {actionMessage && (
          <p role="status" className="mx-5 mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
            {actionMessage}
          </p>
        )}

        {actionError && (
          <p role="alert" className="mx-5 mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {actionError}
          </p>
        )}

        {isLoading ? (
          <div className="p-6">
            <LoadingState message="Loading tool listings..." />
          </div>
        ) : results.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No tools found"
              description="Try changing your search or filters."
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="bg-muted/30 text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-5 py-4 font-medium">Tool</th>
                    <th className="px-5 py-4 font-medium">Owner</th>
                    <th className="px-5 py-4 font-medium">Category</th>
                    <th className="px-5 py-4 font-medium">Condition</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 text-right font-medium">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {results.map((tool) => (
                    <tr key={tool._id} className="transition hover:bg-muted/20">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
                            {tool.imageUrl ? (
                              <img
                                src={tool.imageUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-muted" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground">
                              {tool.name}
                            </p>
                            <p className="mt-1 max-w-xs truncate text-xs text-muted">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-foreground">
                          {tool.owner?.name ?? "Unavailable"}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {tool.owner?.email ?? "No email"}
                        </p>
                      </td>

                      <td className="px-5 py-4 capitalize text-muted">
                        {tool.category.replaceAll("_", " ")}
                      </td>

                      <td className="px-5 py-4 capitalize text-muted">
                        {tool.condition.replaceAll("_", " ")}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={tool.status} />
                      </td>

                      <td className="px-5 py-4 text-right">
                        {tool.status === "active" ? (
                          <button
                            type="button"
                            disabled={busyToolId !== null}
                            onClick={() => handleArchive(tool._id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            <Archive className="h-3.5 w-3.5" />
                            {busyToolId === tool._id
                              ? "Archiving..."
                              : "Archive"}
                          </button>
                        ) : (
                          <span className="text-xs text-muted">
                            No actions
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                Showing {results.length} loaded listings
              </p>

              {paginationStatus === "CanLoadMore" ? (
                <button
                  type="button"
                  onClick={() => loadMore(pageSize)}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                >
                  Load more
                </button>
              ) : paginationStatus === "LoadingMore" ? (
                <span className="text-sm text-muted">Loading more...</span>
              ) : (
                <span className="text-sm text-muted">
                  All matching listings loaded
                </span>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
