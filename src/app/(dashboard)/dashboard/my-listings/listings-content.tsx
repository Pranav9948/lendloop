
"use client";

import { LoadingState } from "@/components/shared/loading-state";
import { PageHeading } from "@/components/shared/page-heading";
import { CreateToolForm } from "@/components/tools/create-tool-form";
import { EditToolForm } from "@/components/tools/edit-tool-form";
import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  CalendarDays,
  Package,
  Pencil,
  Plus,
  Trash2,
  X
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";



export default function MyListingsPage() {
  const tools = useQuery(api.tools.getMyListings, {});
  const deleteTool = useMutation(api.tools.deleteTool);
  const PAGE_SIZE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingToolId, setEditingToolId] =
    useState<Id<"tools"> | null>(null);
  const [busyToolId, setBusyToolId] =
    useState<Id<"tools"> | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    id: Id<"tools">;
    name: string;
  } | null>(null);

  const isFormOpen = showCreateForm || editingToolId !== null;

  // Lock background scrolling and support Escape key
  useEffect(() => {
    if (!isFormOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowCreateForm(false);
        setEditingToolId(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFormOpen]);

  async function handleDelete() {
    if (!pendingDelete) return;

    setBusyToolId(pendingDelete.id);
    setActionError(null);

    try {
      await deleteTool({ toolId: pendingDelete.id });
      setPendingDelete(null);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to archive this listing.",
      );
      setPendingDelete(null);
    } finally {
      setBusyToolId(null);
    }
  }

  const editingTool = tools?.find(
    (tool) => tool._id === editingToolId,
  );

  const activeCount = tools?.filter(
    (tool) => tool.status === "active",
  ).length ?? 0;

  const archivedCount = tools?.filter(
    (tool) => tool.status !== "active",
  ).length ?? 0;

  const totalPages = Math.max(
    1,
    Math.ceil((tools?.length ?? 0) / PAGE_SIZE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedTools = useMemo(() => {
    if (!tools) return [];

    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;

    return tools.slice(startIndex, startIndex + PAGE_SIZE);
  }, [tools, safeCurrentPage]);



  return (
    <div className="space-y-8 pb-10">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <PageHeading
          title="My Listings"
          description="Everything you're sharing with your community, in one place."
        />

        <button
          type="button"
          onClick={() => {
            setShowCreateForm((current) => !current);
            setEditingToolId(null);
          }}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#203b30] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#294c3d] active:scale-[0.98]"
        >
          {showCreateForm ? <X size={17} /> : <Plus size={17} />}
          {showCreateForm ? "Close form" : "Add a tool"}
        </button>
      </div>

      {/* Overview */}
      {tools !== undefined && tools.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e8ede8] bg-white p-4 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#7b897f]">
              <Package size={15} />
              Total listings
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-[#203b30]">
              {tools.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e8ede8] bg-white p-4 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#7b897f]">
              <span className="h-2 w-2 rounded-full bg-[#26976c]" />
              Active listings
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-[#203b30]">
              {activeCount}
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border border-[#e8ede8] bg-white p-4 sm:col-span-1 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#7b897f]">
              <span className="h-2 w-2 rounded-full bg-[#a0aaa2]" />
              Archived
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-[#203b30]">
              {archivedCount}
            </p>
          </div>
        </div>
      )}


      {/* Create / Edit Modal */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#14251d]/60 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => {
            setShowCreateForm(false);
            setEditingToolId(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tool-modal-title"
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-[0_25px_100px_rgba(0,0,0,0.25)]"
          >
            {/* Modal Header */}
            <div className="relative shrink-0 overflow-hidden bg-[#203b30] px-5 py-5 sm:px-7 sm:py-6">
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold tracking-[0.12em] text-[#d7e8dc]">
                    {showCreateForm ? (
                      <>
                        <Plus size={12} />
                        NEW LISTING
                      </>
                    ) : (
                      <>
                        <Pencil size={12} />
                        EDIT LISTING
                      </>
                    )}
                  </div>

                  <h2
                    id="tool-modal-title"
                    className="text-xl font-semibold tracking-tight text-white sm:text-2xl"
                  >
                    {showCreateForm
                      ? "Share something useful."
                      : "Update your listing."}
                  </h2>

                  <p className="mt-1.5 max-w-md text-sm leading-5 text-[#c0d1c5]">
                    {showCreateForm
                      ? "Add a tool to your community and make it available for others."
                      : `Update the details of ${editingTool?.name ?? "your tool"}.`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingToolId(null);
                  }}
                  aria-label="Close modal"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Decorative circles */}
              <div className="pointer-events-none absolute -bottom-20 -right-8 h-48 w-48 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -bottom-12 -right-2 h-32 w-32 rounded-full border border-white/10" />
            </div>

            {/* Scrollable Form Content */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-7">
              {showCreateForm && (
                <CreateToolForm
                  onCreated={() => setShowCreateForm(false)}
                  onCancel={() => setShowCreateForm(false)}
                />
              )}

              {editingTool && (
                <EditToolForm
                  tool={editingTool}
                  onUpdated={() => setEditingToolId(null)}
                  onCancel={() => setEditingToolId(null)}
                />
              )}
            </div>
          </div>
        </div>
      )}



      {/* Archive Confirmation Modal */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#14251d]/60 p-4 backdrop-blur-sm"
          onClick={() => {
            if (busyToolId === null) setPendingDelete(null);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="archive-modal-title"
            aria-describedby="archive-modal-description"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-[#e8ede8] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.2)]"
          >
            <div className="p-6 sm:p-7">
              {/* Warning icon and close */}
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <AlertTriangle size={23} strokeWidth={1.8} />
                </div>

                <button
                  type="button"
                  disabled={busyToolId !== null}
                  onClick={() => setPendingDelete(null)}
                  aria-label="Close confirmation"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#89958c] transition hover:bg-[#f3f5f2] hover:text-[#203b30] disabled:opacity-40"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Message */}
              <div className="mt-5">
                <h2
                  id="archive-modal-title"
                  className="text-lg font-semibold tracking-tight text-[#203b30]"
                >
                  Archive this listing?
                </h2>

                <p
                  id="archive-modal-description"
                  className="mt-2 text-sm leading-6 text-[#78877c]"
                >
                  Are you sure you want to remove{" "}
                  <span className="font-semibold text-[#203b30]">
                    {pendingDelete.name}
                  </span>{" "}
                  from your active community listings?
                </p>
              </div>

              {/* Information */}
              <div className="mt-5 flex gap-3 rounded-xl border border-[#e8ede8] bg-[#f7f9f6] p-3.5">
                <Package
                  size={18}
                  className="mt-0.5 shrink-0 text-[#718477]"
                />
                <p className="text-xs leading-5 text-[#718477]">
                  This listing will be archived and will no longer appear
                  in active tool browsing. You can keep your other listings
                  unaffected.
                </p>
              </div>

              {/* Actions */}
              <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={busyToolId !== null}
                  onClick={() => setPendingDelete(null)}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-[#e1e8e1] px-5 text-sm font-semibold text-[#52675a] transition hover:bg-[#f7f9f6] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={busyToolId !== null}
                  onClick={handleDelete}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busyToolId !== null ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Archiving...
                    </>
                  ) : (
                    <>
                      <Trash2 size={15} />
                      Archive listing
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Error */}
      {actionError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <X size={17} className="mt-0.5 shrink-0" />
          {actionError}
        </div>
      )}

      {/* Listings */}
      <section>
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-[#203b30]">
              Your tools
            </h2>
            <p className="mt-1 text-sm text-[#829087]">
              Manage the items you&apos;ve made available.
            </p>
          </div>

          {tools && tools.length > 0 && (
            <span className="rounded-full bg-[#edf4ee] px-3 py-1 text-xs font-semibold text-[#397653]">
              {tools?.length ?? 0} {(tools?.length ?? 0) === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        {tools === undefined ? (
          <div className="rounded-2xl border border-[#e8ede8] bg-white p-8">
            <LoadingState message="Loading your listings..." />
          </div>
        ) : tools.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d6e2d8] bg-white px-5 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf4ee] text-[#397653]">
              <Package size={25} />
            </div>
            <h3 className="mt-5 text-base font-semibold text-[#203b30]">
              Your first listing starts here
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#829087]">
              Have a tool that someone else could use? Share it with your
              community and make borrowing easier.
            </p>
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-[#203b30] px-4 text-sm font-semibold text-white transition hover:bg-[#294c3d]"
            >
              <Plus size={16} />
              Create your first listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {paginatedTools.map((tool) => (
              <article
                key={tool._id}
                className="group overflow-hidden rounded-2xl border border-[#e8ede8] bg-white transition-all duration-200 hover:-translate-y-1 hover:border-[#cbdace] hover:shadow-[0_12px_35px_rgba(32,59,48,0.08)]"
              >
                {/* Image */}

                <div className="relative aspect-[5/4] overflow-hidden bg-[#f7f8f5]">
                  {tool.imageUrl ? (
                    <Image
                      src={tool.imageUrl}
                      alt={tool.name}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-contain p-5 transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-[#a0aaa2]">
                      <Package size={32} strokeWidth={1.3} />
                      <span className="text-xs font-medium">
                        No photograph available
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5">
                  <div className="min-h-[72px]">
                    <h3 className="line-clamp-1 text-base font-semibold tracking-tight text-[#203b30]">
                      {tool.name}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-[#829087]">
                      {tool.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#edf1ed] pt-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9aa69d]">
                        Condition
                      </p>
                      <p className="mt-1 text-xs font-semibold capitalize text-[#52675a]">
                        {tool.condition.replaceAll("_", " ")}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="flex items-center justify-end gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#9aa69d]">
                        <CalendarDays size={11} />
                        Updated
                      </p>
                      <p className="mt-1 text-xs font-medium text-[#52675a]">
                        {new Date(tool.updatedAt).toLocaleDateString(
                          undefined,
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {tool.status === "active" ? (
                    <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setEditingToolId(tool._id);
                        }}
                        className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#edf4ee] px-3 text-sm font-semibold text-[#326849] transition hover:bg-[#e0ece2]"
                      >
                        <Pencil size={14} />
                        Edit listing
                      </button>

                      <button
                        type="button"
                        disabled={busyToolId !== null}
                        onClick={() => {
                          setActionError(null);
                          setPendingDelete({
                            id: tool._id,
                            name: tool.name,
                          });
                        }}
                        aria-label={`Archive ${tool.name}`}
                        title="Archive listing"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ecefec] text-[#89958c] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busyToolId === tool._id ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#f5f6f4] px-3 py-2.5 text-xs text-[#89958c]">
                      <Package size={14} />
                      This listing is archived
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {tools !== undefined && tools.length > PAGE_SIZE && (
          <div className="mt-8 flex flex-col gap-4 border-t border-[#e8ede8] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#829087]">
              Showing{" "}
              <span className="font-semibold text-[#203b30]">
                {(safeCurrentPage - 1) * PAGE_SIZE + 1}
              </span>
              {" – "}
              <span className="font-semibold text-[#203b30]">
                {Math.min(safeCurrentPage * PAGE_SIZE, tools?.length ?? 0)}
              </span>
              {" of "}
              <span className="font-semibold text-[#203b30]">
                {tools?.length ?? 0}
              </span>{" "}
              listings
            </p>

            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <button
                type="button"
                disabled={safeCurrentPage === 1}
                onClick={() =>
                  setCurrentPage((page) => Math.max(1, page - 1))
                }
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e5ebe5] bg-white px-4 text-xs font-semibold text-[#52675a] transition hover:bg-[#f5f8f4] disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              <span className="min-w-16 text-center text-xs font-semibold text-[#52675a]">
                {safeCurrentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={safeCurrentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1),
                  )
                }
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e5ebe5] bg-white px-4 text-xs font-semibold text-[#52675a] transition hover:bg-[#f5f8f4] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
