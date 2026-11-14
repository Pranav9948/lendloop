
"use client";

import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Package,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeading } from "@/components/shared/page-heading";
import { SectionCard } from "@/components/shared/section-card";
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

type LoanFilter = "all" | "active" | "returned";

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MyLoansPage() {
  const loans = useQuery(api.loans.getMyLoans, {});
  const markLoanReturned = useMutation(api.loans.markLoanReturned);

  const [busyLoanId, setBusyLoanId] =
    useState<Id<"loans"> | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<LoanFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [pendingReturn, setPendingReturn] = useState<{
    id: Id<"loans">;
    toolName: string;
  } | null>(null);

  // Sort loans by newest first and apply the selected filter.
  // returnedAt is used because it is already part of your loan data.
  const filteredLoans = useMemo(() => {
    if (!loans) return [];

    const sortedLoans = [...loans].sort(
      (a, b) => b.createdAt - a.createdAt,
    );

    if (statusFilter === "active") {
      return sortedLoans.filter(
        (loan) => loan.returnedAt === undefined,
      );
    }

    if (statusFilter === "returned") {
      return sortedLoans.filter(
        (loan) => loan.returnedAt !== undefined,
      );
    }

    return sortedLoans;
  }, [loans, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLoans.length / PAGE_SIZE),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedLoans = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;

    return filteredLoans.slice(
      startIndex,
      startIndex + PAGE_SIZE,
    );
  }, [filteredLoans, safeCurrentPage]);

  const activeCount =
    loans?.filter((loan) => loan.returnedAt === undefined).length ?? 0;

  const returnedCount =
    loans?.filter((loan) => loan.returnedAt !== undefined).length ?? 0;


  // Handle Escape and prevent background scrolling while the modal is open.
  useEffect(() => {
    if (!pendingReturn) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && busyLoanId === null) {
        setPendingReturn(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pendingReturn, busyLoanId]);

  async function handleReturn(loanId: Id<"loans">) {
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

  const filters: {
    label: string;
    value: LoanFilter;
    count: number;
  }[] = [
      {
        label: "All loans",
        value: "all",
        count: loans?.length ?? 0,
      },
      {
        label: "Not returned",
        value: "active",
        count: activeCount,
      },
      {
        label: "Returned",
        value: "returned",
        count: returnedCount,
      },
    ];

  return (
    <div className="space-y-8 pb-10">
      {/* Page heading */}
      <div>
        <PageHeading
          title="My Loans"
          description="Track your active and completed borrowing activity."
        />
      </div>

      {/* Overview */}
      {loans && loans.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e8ede8] bg-white p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#829087]">
              <Package size={16} />
              Total loans
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-[#203b30]">
              {loans.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e8ede8] bg-white p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#829087]">
              <CalendarDays size={16} className="text-amber-600" />
              Not returned
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-[#203b30]">
              {activeCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e8ede8] bg-white p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#829087]">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Returned
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-[#203b30]">
              {returnedCount}
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
          <AlertTriangle size={17} className="mt-0.5 shrink-0" />
          <span>{actionError}</span>

          <button
            type="button"
            onClick={() => setActionError(null)}
            aria-label="Dismiss error"
            className="ml-auto shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {actionSuccess && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
          <span>{actionSuccess}</span>

          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            aria-label="Dismiss success message"
            className="ml-auto shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Loans section */}
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
          <>
            {/* Status filters */}
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => {
                    setStatusFilter(filter.value);
                    setCurrentPage(1);
                  }}
                  aria-pressed={statusFilter === filter.value}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition ${statusFilter === filter.value
                    ? "bg-[#203b30] text-white"
                    : "border border-[#e5ebe5] bg-white text-[#647469] hover:bg-[#f3f7f2]"
                    }`}
                >
                  {filter.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${statusFilter === filter.value
                      ? "bg-white/15 text-white"
                      : "bg-[#f0f3ef] text-[#718477]"
                      }`}
                  >
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Loan cards */}
            {filteredLoans.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#d6e2d8] bg-white px-5 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf4ee] text-[#397653]">
                  <Package size={27} />
                </div>

                <h3 className="mt-4 text-base font-semibold text-[#203b30]">
                  No matching loans
                </h3>

                <p className="mt-2 text-sm text-[#829087]">
                  There are no loans in this category.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedLoans.map((loan) => {
                  // imageUrl is added by the getMyLoans query below.
                  const toolImageUrl = (
                    loan.tool as
                    | (NonNullable<typeof loan.tool> & {
                      imageUrl?: string | null;
                    })
                    | null
                  )?.imageUrl;

                  return (
                    <article
                      key={loan._id}
                      className="group overflow-hidden rounded-2xl border border-[#e8ede8] bg-white shadow-[0_2px_10px_rgba(23,43,37,0.03)] transition-all duration-200 hover:border-[#cbdace] hover:shadow-[0_8px_28px_rgba(32,59,48,0.06)]"
                    >
                      <div className="p-4 sm:p-5">
                        {/* Tool details */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex min-w-0 items-center gap-4">
                            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f5f7f3]">
                              {toolImageUrl ? (
                                <Image
                                  src={toolImageUrl}
                                  alt={loan.tool?.name ?? "Loaned tool"}
                                  fill
                                  unoptimized
                                  sizes="96px"
                                  className="object-contain p-2"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-[#a0aaa2]">
                                  <Package size={30} strokeWidth={1.4} />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <h3 className="font-semibold text-[#203b30]">
                                {loan.tool?.name ??
                                  "Tool no longer available"}
                              </h3>

                              {loan.tool && (
                                <p className="mt-1 text-xs text-[#718477]">
                                  {categoryLabels[loan.tool.category] ??
                                    "Other"}
                                </p>
                              )}

                              <span
                                className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${loan.relationship === "borrowed"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-purple-50 text-purple-700"
                                  }`}
                              >
                                {loan.relationship === "borrowed"
                                  ? "Borrowed by you"
                                  : "Lent by you"}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0">
                            <StatusBadge status={loan.status} />
                          </div>
                        </div>

                        {/* Loan dates */}
                        <div className="mt-5 grid grid-cols-1 gap-3 rounded-xl bg-[#f8faf7] p-4 sm:grid-cols-2">
                          <div>
                            <p className="flex items-center gap-2 text-xs font-medium text-[#829087]">
                              <CalendarDays size={14} />
                              Start date
                            </p>
                            <p className="mt-2 text-sm font-semibold text-[#203b30]">
                              {formatDate(loan.startDate)}
                            </p>
                          </div>

                          <div>
                            <p className="flex items-center gap-2 text-xs font-medium text-[#829087]">
                              <CalendarDays size={14} />
                              Due date
                            </p>
                            <p className="mt-2 text-sm font-semibold text-[#203b30]">
                              {formatDate(loan.dueDate)}
                            </p>
                          </div>
                        </div>

                        {/* Return status and action */}
                        {loan.returnedAt !== undefined ? (
                          <div className="mt-4 flex items-center gap-2 border-t border-[#edf1ed] pt-4 text-xs font-medium text-emerald-700">
                            <CheckCircle2 size={15} />
                            Returned on {formatDate(loan.returnedAt)}
                          </div>
                        ) : loan.relationship === "lent" &&
                          loan.status === "active" ? (
                          <div className="mt-4 flex flex-col gap-3 border-t border-[#edf1ed] pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-[#829087]">
                              Confirm once the borrower has returned your
                              tool.
                            </p>

                            <button
                              type="button"
                              disabled={busyLoanId !== null}
                              onClick={() => {
                                setActionError(null);
                                setActionSuccess(null);

                                setPendingReturn({
                                  id: loan._id,
                                  toolName:
                                    loan.tool?.name ?? "this tool",
                                });
                              }}
                              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#203b30] px-4 text-xs font-semibold text-white transition hover:bg-[#294c3d] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <CheckCircle2 size={15} />
                              Mark as Returned
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {filteredLoans.length > PAGE_SIZE && (
              <div className="mt-6 flex flex-col gap-4 border-t border-[#e8ede8] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-[#829087]">
                  Showing{" "}
                  <span className="font-semibold text-[#203b30]">
                    {(currentPage - 1) * PAGE_SIZE + 1}
                  </span>
                  {" – "}
                  <span className="font-semibold text-[#203b30]">
                    {Math.min(
                      currentPage * PAGE_SIZE,
                      filteredLoans.length,
                    )}
                  </span>
                  {" of "}
                  <span className="font-semibold text-[#203b30]">
                    {filteredLoans.length}
                  </span>{" "}
                  loans
                </p>

                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    className="inline-flex h-10 items-center gap-1 rounded-lg border border-[#e5ebe5] px-4 text-xs font-semibold text-[#52675a] transition hover:bg-[#f5f8f4] disabled:cursor-not-allowed disabled:opacity-40"
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
                    className="inline-flex h-10 items-center gap-1 rounded-lg border border-[#e5ebe5] px-4 text-xs font-semibold text-[#52675a] transition hover:bg-[#f5f8f4] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </SectionCard>

      {/* Custom return confirmation modal */}
      {pendingReturn && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#14251d]/60 p-4 backdrop-blur-sm"
          onClick={() => {
            if (busyLoanId === null) {
              setPendingReturn(null);
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="return-modal-title"
            aria-describedby="return-modal-description"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-[#e8ede8] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.2)]"
          >
            <div className="p-6 sm:p-7">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <AlertTriangle size={23} />
                </div>

                <button
                  type="button"
                  disabled={busyLoanId !== null}
                  onClick={() => setPendingReturn(null)}
                  aria-label="Close confirmation"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#89958c] transition hover:bg-[#f3f5f2] hover:text-[#203b30] disabled:opacity-40"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5">
                <h2
                  id="return-modal-title"
                  className="text-lg font-semibold tracking-tight text-[#203b30]"
                >
                  Confirm tool return?
                </h2>

                <p
                  id="return-modal-description"
                  className="mt-2 text-sm leading-6 text-[#78877c]"
                >
                  Confirm that{" "}
                  <span className="font-semibold text-[#203b30]">
                    {pendingReturn.toolName}
                  </span>{" "}
                  has been returned. This will update the loan status.
                </p>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={busyLoanId !== null}
                  onClick={() => setPendingReturn(null)}
                  className="h-10 rounded-xl border border-[#e1e8e1] px-5 text-sm font-semibold text-[#52675a] transition hover:bg-[#f5f8f4] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={busyLoanId !== null}
                  onClick={async () => {
                    const loanId = pendingReturn.id;

                    await handleReturn(loanId);

                    setPendingReturn(null);
                  }}
                  className="h-10 rounded-xl bg-[#23845e] px-5 text-sm font-semibold text-white transition hover:bg-[#196b4b] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyLoanId !== null
                    ? "Processing..."
                    : "Yes, confirm return"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
