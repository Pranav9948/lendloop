
"use client";

import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Package,
  X,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { LoadingState } from "@/components/shared/loading-state";
import { PageHeading } from "@/components/shared/page-heading";
import { StatusBadge } from "@/components/shared/status-badge";

import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

const PAGE_SIZE = 6;

const categoryLabels: Record<string, string> = {
  power_tools: "Power Tools",
  garden: "Garden",
  kitchen: "Kitchen",
  camping: "Camping",
  other: "Other",
};

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateRange(startDate: number, endDate: number) {
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

export default function MyRequestsPage() {
  const requests = useQuery(api.borrowRequests.getMyRequests, {});

  const cancelRequest = useMutation(
    api.borrowRequests.cancelBorrowRequest,
  );

  const [busyRequestId, setBusyRequestId] =
    useState<Id<"borrowRequests"> | null>(null);

  const [pendingCancel, setPendingCancel] = useState<{
    id: Id<"borrowRequests">;
    toolName: string;
  } | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  // Latest requests first
  const sortedRequests = useMemo(() => {
    if (!requests) return [];

    return [...requests].sort(
      (a, b) => b.createdAt - a.createdAt,
    );
  }, [requests]);

  const filteredRequests = useMemo(() => {
    if (statusFilter === "all") return sortedRequests;

    return sortedRequests.filter(
      (request) => request.status === statusFilter,
    );
  }, [sortedRequests, statusFilter]);

  // Client-side pagination

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / PAGE_SIZE),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRequests = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;

    return filteredRequests.slice(
      startIndex,
      startIndex + PAGE_SIZE,
    );
  }, [filteredRequests, safeCurrentPage]);

  // Confirmation modal keyboard and scroll behaviour
  useEffect(() => {
    if (!pendingCancel) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && busyRequestId === null) {
        setPendingCancel(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pendingCancel, busyRequestId]);

  async function handleCancel() {
    if (!pendingCancel) return;

    setBusyRequestId(pendingCancel.id);
    setActionError(null);
    setActionSuccess(null);

    try {
      await cancelRequest({
        requestId: pendingCancel.id,
      });

      setActionSuccess(
        `"${pendingCancel.toolName}" request cancelled successfully.`,
      );

      setPendingCancel(null);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to cancel this request. Please try again.",
      );

      setPendingCancel(null);
    } finally {
      setBusyRequestId(null);
    }
  }

  const pendingCount =
    sortedRequests.filter((r) => r.status === "pending").length;

  const approvedCount =
    sortedRequests.filter((r) => r.status === "approved").length;

  const declinedCount =
    sortedRequests.filter((r) => r.status === "declined").length;


  return (
    <div className="space-y-8 pb-10">
      {/* Page heading */}
      <div>
        <PageHeading
          title="My Requests"
          description="Keep track of the tools you've requested from your community."
        />
      </div>

      {/* Overview */}
      {requests && requests.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#e8ede8] bg-white p-4 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#829087]">
              <Package size={15} />
              Total requests
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-[#203b30]">
              {filteredRequests.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e8ede8] bg-white p-4 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#829087]">
              <Clock3 size={15} className="text-amber-600" />
              Pending
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-[#203b30]">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e8ede8] bg-white p-4 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#829087]">
              <CheckCircle2 size={15} className="text-[#26976c]" />
              Approved
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-[#203b30]">
              {approvedCount}
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border border-[#e8ede8] bg-white p-4 sm:col-span-1 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#829087]">
              <Package size={15} className="text-[#718477]" />
              Declined
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-[#203b30]">
              {declinedCount}
            </p>
          </div>
        </div>
      )}

      {/* Feedback messages */}
      {actionError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <XCircle size={17} className="mt-0.5 shrink-0" />
          <span className="flex-1">{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {actionSuccess && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-[#d5e9d9] bg-[#f0f8f1] px-4 py-3 text-sm text-[#32744c]"
        >
          <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
          <span className="flex-1">{actionSuccess}</span>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Requests section */}
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-[#203b30]">
              Your borrowing activity
            </h2>
            <p className="mt-1 text-sm text-[#829087]">
              View the status and details of your requests.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {[
                { label: "All", value: "all" },
                { label: "Pending", value: "pending" },
                { label: "Approved", value: "approved" },
                { label: "Declined", value: "declined" },
                { label: "Cancelled", value: "cancelled" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => {
                    setStatusFilter(filter.value);
                    setCurrentPage(1);
                  }}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${statusFilter === filter.value
                    ? "bg-[#203b30] text-white shadow-sm"
                    : "border border-[#e5ebe5] bg-white text-[#647469] hover:bg-[#f3f7f2]"
                    }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {requests && requests.length > 0 && (
            <span className="rounded-full bg-[#edf4ee] px-3 py-1.5 text-xs font-semibold text-[#397653]">
              {filteredRequests.length}{" "}
              {filteredRequests.length === 1 ? "request" : "requests"}
            </span>
          )}
        </div>

        {requests === undefined ? (
          <div className="rounded-2xl border border-[#e8ede8] bg-white p-8">
            <LoadingState message="Loading your requests..." />
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d6e2d8] bg-white px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf4ee] text-[#397653]">
              <Package size={26} />
            </div>

            <h3 className="mt-5 text-base font-semibold text-[#203b30]">
              No borrowing requests yet
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#829087]">
              When you find a useful tool in the community marketplace
              and request to borrow it, your request will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Request cards */}


            {paginatedRequests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#d6e2d8] bg-white px-5 py-12 text-center">
                <Package
                  size={28}
                  className="mx-auto text-[#829087]"
                />
                <h3 className="mt-4 text-sm font-semibold text-[#203b30]">
                  No {statusFilter} requests
                </h3>
                <p className="mt-1 text-sm text-[#829087]">
                  There are no requests matching this status.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                  className="mt-4 rounded-lg bg-[#203b30] px-4 py-2 text-xs font-semibold text-white"
                >
                  Clear filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">

                {paginatedRequests.map((request) => (
                  <article
                    key={request._id}
                    className="group overflow-hidden rounded-2xl border border-[#e8ede8] bg-white transition-all duration-200 hover:border-[#cbdace] hover:shadow-[0_8px_28px_rgba(32,59,48,0.06)]"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Tool image */}
                      <div className="relative h-48 shrink-0 overflow-hidden bg-[#f5f7f3] sm:h-auto sm:min-h-[210px] sm:w-44">
                        {request.tool?.imageUrl ? (
                          <Image
                            src={request.tool.imageUrl}
                            alt={request.tool.name ?? "Requested tool"}
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 100vw, 176px"
                            className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-full min-h-40 flex-col items-center justify-center gap-2 text-[#a0aaa2]">
                            <Package size={30} strokeWidth={1.4} />
                            <span className="text-xs font-medium">
                              Image unavailable
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Request details */}
                      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9aa69d]">
                              {request.tool
                                ? categoryLabels[request.tool.category] ?? "Other"
                                : "Tool listing"}
                            </p>

                            <h3 className="mt-1 line-clamp-2 text-base font-semibold tracking-tight text-[#203b30]">
                              {request.tool?.name ??
                                "Tool no longer available"}
                            </h3>
                          </div>

                          <div className="shrink-0">
                            <StatusBadge status={request.status} />
                          </div>
                        </div>

                        {/* Borrowing dates */}
                        <div className="mt-5 rounded-xl bg-[#f7f9f6] p-3.5">
                          <div className="flex items-center gap-2 text-xs font-semibold text-[#718477]">
                            <CalendarDays size={14} />
                            Borrowing period
                          </div>

                          <p className="mt-2 text-sm font-semibold text-[#203b30]">
                            {formatDateRange(
                              request.startDate,
                              request.endDate,
                            )}
                          </p>
                        </div>

                        {/* Submission date */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs text-[#89958c]">
                            Submitted {formatDate(request.createdAt)}
                          </p>

                          {request.status === "pending" && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                              <Clock3 size={13} />
                              Awaiting response
                            </span>
                          )}
                        </div>

                        {/* Cancel action */}
                        {request.status === "pending" && (
                          <div className="mt-4 border-t border-[#edf1ed] pt-3">
                            <button
                              type="button"
                              disabled={busyRequestId !== null}
                              onClick={() => {
                                setActionError(null);
                                setActionSuccess(null);
                                setPendingCancel({
                                  id: request._id,
                                  toolName:
                                    request.tool?.name ??
                                    "this tool",
                                });
                              }}
                              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#f0d8d8] px-3 text-xs font-semibold text-[#c34d4d] transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <X size={14} />
                              Cancel request
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-[#e8ede8] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-xs text-[#829087]">
                  Showing{" "}
                  <span className="font-semibold text-[#203b30]">
                    {(currentPage - 1) * PAGE_SIZE + 1}
                  </span>
                  {" – "}
                  <span className="font-semibold text-[#203b30]">
                    {Math.min(
                      currentPage * PAGE_SIZE,
                      filteredRequests.length,
                    )}
                  </span>
                  {" of "}
                  <span className="font-semibold text-[#203b30]">
                    {filteredRequests.length}
                  </span>{" "}
                  requests
                </p>

                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#e5ebe5] px-3 text-xs font-semibold text-[#52675a] transition hover:bg-[#f5f8f4] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={15} />
                    Previous
                  </button>

                  <span className="min-w-16 text-center text-xs font-semibold text-[#52675a]">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1),
                      )
                    }
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#e5ebe5] px-3 text-xs font-semibold text-[#52675a] transition hover:bg-[#f5f8f4] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Cancel confirmation modal */}
      {pendingCancel && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#14251d]/60 p-4 backdrop-blur-sm"
          onClick={() => {
            if (busyRequestId === null) {
              setPendingCancel(null);
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="cancel-request-title"
            aria-describedby="cancel-request-description"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-[#e8ede8] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.2)]"
          >
            <div className="p-6 sm:p-7">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <AlertTriangle size={23} />
                </div>

                <button
                  type="button"
                  disabled={busyRequestId !== null}
                  onClick={() => setPendingCancel(null)}
                  aria-label="Close confirmation"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#89958c] transition hover:bg-[#f3f5f2] disabled:opacity-40"
                >
                  <X size={18} />
                </button>
              </div>

              <h2
                id="cancel-request-title"
                className="mt-5 text-lg font-semibold tracking-tight text-[#203b30]"
              >
                Cancel borrowing request?
              </h2>

              <p
                id="cancel-request-description"
                className="mt-2 text-sm leading-6 text-[#78877c]"
              >
                Are you sure you want to cancel your request for{" "}
                <span className="font-semibold text-[#203b30]">
                  {pendingCancel.toolName}
                </span>
                ?
              </p>

              <div className="mt-5 rounded-xl border border-[#eee9dc] bg-[#fbfaf6] p-3.5">
                <p className="text-xs leading-5 text-[#82765c]">
                  Once cancelled, this request will no longer be
                  available for the tool owner to approve.
                </p>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={busyRequestId !== null}
                  onClick={() => setPendingCancel(null)}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-[#e1e8e1] px-5 text-sm font-semibold text-[#52675a] transition hover:bg-[#f7f9f6] disabled:opacity-50"
                >
                  Keep request
                </button>

                <button
                  type="button"
                  disabled={busyRequestId !== null}
                  onClick={handleCancel}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busyRequestId !== null ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <X size={15} />
                      Yes, cancel request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
