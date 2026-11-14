
"use client";

import { useMutation, useQuery } from "convex/react";
import { Check, X } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeading } from "@/components/shared/page-heading";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";

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
            {requests.map((request) => (
              <article
                key={request._id}
                className="rounded-xl border border-border p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {request.tool?.name ?? "Tool no longer available"}
                    </h3>

                    {request.tool && (
                      <p className="mt-1 text-xs text-primary">
                        {categoryLabels[request.tool.category]}
                      </p>
                    )}
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
                        handleDecision(request._id, "approve")
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
                        handleDecision(request._id, "decline")
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
    </div>
  );
}
