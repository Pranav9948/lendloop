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

export default function MyLoansPage() {
  const loans = useQuery(api.loans.getMyLoans, {});

  const markLoanReturned = useMutation(api.loans.markLoanReturned);

  const [busyLoanId, setBusyLoanId] =
    useState<Id<"loans"> | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);


  async function handleReturn(loanId: Id<"loans">) {
    const confirmed = window.confirm(
      "Confirm that this tool has been returned?",
    );

    if (!confirmed) return;

    setBusyLoanId(loanId);
    setActionError(null);
    setActionSuccess(null);

    try {
      await markLoanReturned({ loanId });

      setActionSuccess("Tool return confirmed successfully.");
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to confirm the tool return.",
      );
    } finally {
      setBusyLoanId(null);
    }
  }

  return (
    <div>
      <PageHeading
        title="My Loans"
        description="Track your active and completed borrowing activity."
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
        title="Your Loans"
        description="Tools you have borrowed or lent to community members."
      >
        {loans === undefined ? (
          <LoadingState message="Loading your loans..." />
        ) : loans.length === 0 ? (
          <EmptyState
            title="No loans yet"
            description="Your loans will appear here when a borrowing request is approved."
          />
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => (
              <article
                key={loan._id}
                className="rounded-xl border border-border p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {loan.tool?.name ?? "Tool no longer available"}
                    </h3>

                    {loan.tool && (
                      <p className="mt-1 text-xs text-primary">
                        {categoryLabels[loan.tool.category]}
                      </p>
                    )}
                  </div>

                  <StatusBadge status={loan.status} />
                </div>

                <div className="mt-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${loan.relationship === "borrowed"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-purple-50 text-purple-700"
                      }`}
                  >
                    {loan.relationship === "borrowed"
                      ? "Borrowed by you"
                      : "Lent by you"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted">Start date</p>
                    <p className="mt-1 font-medium">
                      {formatDate(loan.startDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted">Due date</p>
                    <p className="mt-1 font-medium">
                      {formatDate(loan.dueDate)}
                    </p>
                  </div>
                </div>

                {loan.returnedAt !== undefined ? (
                  <p className="mt-4 border-t border-border pt-3 text-xs text-muted">
                    Returned on: {formatDate(loan.returnedAt)}
                  </p>
                ) : loan.relationship === "lent" && loan.status === "active" ? (
                  <div className="mt-4 border-t border-border pt-4">
                    <button
                      type="button"
                      disabled={busyLoanId !== null}
                      onClick={() => handleReturn(loan._id)}
                      className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busyLoanId === loan._id
                        ? "Processing..."
                        : "Mark as Returned"}
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
