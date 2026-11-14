"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeading } from "@/components/shared/page-heading";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
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

export default function MyRequestsPage() {
  const requests = useQuery(api.borrowRequests.getMyRequests, {});

  const cancelRequest = useMutation(
    api.borrowRequests.cancelBorrowRequest,
  );

  const [busyRequestId, setBusyRequestId] =
    useState<Id<"borrowRequests"> | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);


  async function handleCancel(requestId: Id<"borrowRequests">) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this borrowing request?",
    );

    if (!confirmed) return;

    setBusyRequestId(requestId);
    setActionError(null);
    setActionSuccess(null);

    try {
      await cancelRequest({ requestId });

      setActionSuccess("Borrowing request cancelled successfully.");
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to cancel this request.",
      );
    } finally {
      setBusyRequestId(null);
    }
  }

  return (
    <div>
      <PageHeading
        title="My Requests"
        description="Track the borrowing requests you have submitted."
      />

      {actionError && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {actionError}
        </p>
      )}

      {actionSuccess && (
        <p
          role="status"
          className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700"
        >
          {actionSuccess}
        </p>
      )}

      <SectionCard
        title="Your Borrowing Requests"
        description="Requests submitted from your account."
      >
        {requests === undefined ? (
          <LoadingState message="Loading your requests..." />
        ) : requests.length === 0 ? (
          <EmptyState
            title="No borrowing requests yet"
            description="When you request to borrow a community tool, it will appear here."
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
                  <div className="mt-4">
                    <button
                      type="button"
                      disabled={busyRequestId !== null}
                      onClick={() => handleCancel(request._id)}
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busyRequestId === request._id
                        ? "Cancelling..."
                        : "Cancel Request"}
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
