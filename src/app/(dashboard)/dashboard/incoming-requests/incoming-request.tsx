
"use client";

import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  Check,
  Package,
  X
} from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeading } from "@/components/shared/page-heading";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";

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

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString();
}

export default function IncomingRequestsPage() {
  const requests = useQuery(api.borrowRequests.getIncomingRequests, {});

  const approveRequest = useMutation(
    api.borrowRequests.approveBorrowRequest,
  );

  const declineRequest = useMutation(
    api.borrowRequests.declineBorrowRequest,
  );

  const [busyRequestId, setBusyRequestId] =
    useState<Id<"borrowRequests"> | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const PAGE_SIZE = 6;

  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [confirmation, setConfirmation] = useState<{
    requestId: Id<"borrowRequests">;
    decision: "approve" | "decline";
    toolName: string;
  } | null>(null);

  const filteredRequests = useMemo(() => {
    if (!requests) return [];

    const sorted = [...requests].sort(
      (a, b) => b.createdAt - a.createdAt,
    );

    if (statusFilter === "all") return sorted;

    return sorted.filter(
      (request) => request.status === statusFilter,
    );
  }, [requests, statusFilter]);

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



  async function handleDecision(
    requestId: Id<"borrowRequests">,
    decision: "approve" | "decline",
  ) {
    setBusyRequestId(requestId);
    setActionError(null);
    setActionSuccess(null);

    try {
      if (decision === "approve") {
        await approveRequest({ requestId });
        setActionSuccess("Borrow request approved successfully.");
      } else {
        await declineRequest({ requestId });
        setActionSuccess("Borrow request declined successfully.");
      }
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to process this request.",
      );
    } finally {
      setBusyRequestId(null);
    }
  }

  return (
    <div>
      <PageHeading
        title="Incoming Requests"
        description="Review borrowing requests for your tools."
      />

      {actionError && (
        <p
          role="alert"
          className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {actionError}
        </p>
      )}

      {actionSuccess && (
        <p
          role="status"
          className="mb-5 rounded-lg bg-green-50 p-3 text-sm text-green-700"
        >
          {actionSuccess}
        </p>
      )}

      {requests && requests.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { label: "All", value: "all" },
            { label: "Pending", value: "pending" },
            { label: "Approved", value: "approved" },
            { label: "Declined", value: "declined" },
          ].map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setStatusFilter(filter.value);
                setCurrentPage(1);
              }}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${statusFilter === filter.value
                ? "bg-[#203b30] text-white"
                : "border border-[#e5ebe5] bg-white text-[#647469] hover:bg-[#f3f7f2]"
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      <SectionCard
        title="Requests for Your Tools"
        description="Requests submitted by community members."
      >
        {requests === undefined ? (
          <LoadingState message="Loading incoming requests..." />
        ) : requests.length === 0 ? (
          <EmptyState
            title="No incoming requests"
            description="When someone requests one of your tools, it will appear here."
          />
        ) : (
          <div className="space-y-4">
            {paginatedRequests.map((request) => (
              <article
                key={request._id}
                className="rounded-2xl border border-border bg-white p-4 shadow-[0_2px_10px_rgba(23,43,37,0.03)] sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f5f7f3]">
                      {request.tool?.imageUrl ? (
                        <Image
                          src={request.tool.imageUrl}
                          alt={request.tool.name ?? "Tool"}
                          fill
                          unoptimized
                          sizes="96px"
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#a0aaa2]">
                          <Package size={28} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#203b30]">
                        {request.tool?.name ?? "Tool no longer available"}
                      </h3>

                      {request.tool && (
                        <p className="mt-1 text-xs text-[#718477]">
                          {categoryLabels[request.tool.category] ?? "Other"}
                        </p>
                      )}
                    </div>
                  </div>

                  <StatusBadge status={request.status} />
                </div>

                <div className="mt-4">
                  <p className="text-xs text-muted">Requested by</p>
                  <p className="mt-1 text-sm font-medium">
                    {request.borrower?.name ?? "Member unavailable"}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted">Requested from</p>
                    <p className="mt-1 font-medium">
                      {formatDate(request.startDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted">Requested until</p>
                    <p className="mt-1 font-medium">
                      {formatDate(request.endDate)}
                    </p>
                  </div>
                </div>

                <p className="mt-4 border-t border-border pt-3 text-xs text-muted">
                  Submitted: {formatDate(request.createdAt)}
                </p>

                {request.status === "pending" && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={busyRequestId !== null}
                      onClick={() =>
                        setConfirmation({
                          requestId: request._id,
                          decision: "approve",
                          toolName: request.tool?.name ?? "this tool",
                        })
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Check size={16} />
                      {busyRequestId === request._id
                        ? "Processing..."
                        : "Approve"}
                    </button>

                    <button
                      type="button"
                      disabled={busyRequestId !== null}
                      onClick={() =>
                        setConfirmation({
                          requestId: request._id,
                          decision: "decline",
                          toolName: request.tool?.name ?? "this tool",
                        })
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <X size={16} />
                      {busyRequestId === request._id
                        ? "Processing..."
                        : "Decline"}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>


        )}
      </SectionCard>




      {confirmation && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#14251d]/60 p-4 backdrop-blur-sm"
          onClick={() => {
            if (busyRequestId === null) setConfirmation(null);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-[#e8ede8] bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <AlertTriangle size={23} />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-[#203b30]">
              {confirmation.decision === "approve"
                ? "Approve this request?"
                : "Decline this request?"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#78877c]">
              Are you sure you want to{" "}
              {confirmation.decision === "approve" ? "approve" : "decline"} the
              request for{" "}
              <strong>{confirmation.toolName}</strong>?
            </p>

            <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={busyRequestId !== null}
                onClick={() => setConfirmation(null)}
                className="h-10 rounded-xl border border-[#e1e8e1] px-5 text-sm font-semibold text-[#52675a]"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={busyRequestId !== null}
                onClick={async () => {
                  const selected = confirmation;
                  setConfirmation(null);
                  await handleDecision(
                    selected.requestId,
                    selected.decision,
                  );
                }}
                className={`h-10 rounded-xl px-5 text-sm font-semibold text-white disabled:opacity-50 ${confirmation.decision === "approve"
                  ? "bg-[#23845e] hover:bg-[#196b4b]"
                  : "bg-red-600 hover:bg-red-700"
                  }`}
              >
                {busyRequestId !== null
                  ? "Processing..."
                  : confirmation.decision === "approve"
                    ? "Yes, approve"
                    : "Yes, decline"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
