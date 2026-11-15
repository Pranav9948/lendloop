
"use client";

import { usePaginatedQuery, useQuery } from "convex/react";
import { CalendarDays, Handshake, RotateCcw, Search } from "lucide-react";
import { useState } from "react";

import { api } from "../../../../../../convex/_generated/api";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeading } from "@/components/shared/page-heading";
import { StatusBadge } from "@/components/shared/status-badge";

const statusOptions = [
  { label: "All loans", value: "" },
  { label: "Active", value: "active" },
  { label: "Overdue", value: "overdue" },
  { label: "Returned", value: "returned" },
] as const;

export default function AdminLoansPage() {
  const profile = useQuery(api.users.getCurrentUserProfile);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [pageSize, setPageSize] = useState(10);

  if (profile === undefined) {
    return <LoadingState message="Loading admin profile..." />;
  }

  if (!profile || profile.role !== "admin") {
    return (
      <ErrorState
        title="Access denied"
        description="You do not have permission to view platform loans."
      />
    );
  }

  return (
    <LoansTable
      key={`${pageSize}-${status}`}
      search={search}
      setSearch={setSearch}
      status={status}
      setStatus={setStatus}
      pageSize={pageSize}
      setPageSize={setPageSize}
    />
  );
}

function LoansTable({
  search,
  setSearch,
  status,
  setStatus,
  pageSize,
  setPageSize,
}: {
  search: string;
  setSearch: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  pageSize: number;
  setPageSize: (value: number) => void;
}) {
  const { results, status: paginationStatus, loadMore } =
    usePaginatedQuery(
      api.admin.getPaginatedLoans,
      {
        search: search.trim() || undefined,
        status: status
          ? (status as "active" | "returned" | "overdue")
          : undefined,
      },
      { initialNumItems: pageSize },
    );

  const activeCount = results.filter(
    (loan) => loan.status === "active" && !loan.isOverdue,
  ).length;

  const overdueCount = results.filter((loan) => loan.isOverdue).length;

  const returnedCount = results.filter(
    (loan) => loan.status === "returned",
  ).length;

  const isLoading = paginationStatus === "LoadingFirstPage";

  function formatDate(timestamp: number) {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(timestamp));
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="All Loans"
        description="Monitor borrowing activity, loan status and overdue items across LendLoop."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">Active loans</p>
            <Handshake className="h-5 w-5 text-muted" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-foreground">
            {activeCount}
          </p>
          <p className="mt-1 text-xs text-muted">
            Active loans in loaded results
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">Overdue loans</p>
            <CalendarDays className="h-5 w-5 text-red-600" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-foreground">
            {overdueCount}
          </p>
          <p className="mt-1 text-xs text-muted">
            Active loans past their due date
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">Returned loans</p>
            <RotateCcw className="h-5 w-5 text-muted" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-foreground">
            {returnedCount}
          </p>
          <p className="mt-1 text-xs text-muted">
            Returned loans in loaded results
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="space-y-4 border-b border-border p-5">
          <div>
            <h2 className="font-semibold text-foreground">
              Loan records
            </h2>
            <p className="mt-1 text-sm text-muted">
              Search and filter platform borrowing activity.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by tool, borrower or lender..."
                className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary"
              />
            </div>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
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
                setStatus("");
              }}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" />
              Clear filters
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6">
            <LoadingState message="Loading loan records..." />
          </div>
        ) : results.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No loans found"
              description="There are no loans matching your search or selected filter."
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-muted/30 text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-5 py-4 font-medium">Tool</th>
                    <th className="px-5 py-4 font-medium">Borrower</th>
                    <th className="px-5 py-4 font-medium">Lender</th>
                    <th className="px-5 py-4 font-medium">Start date</th>
                    <th className="px-5 py-4 font-medium">Due date</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {results.map((loan) => (
                    <tr
                      key={loan._id}
                      className="transition hover:bg-muted/20"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-foreground">
                          {loan.tool?.name ?? "Unavailable"}
                        </p>
                        {loan.tool?.category && (
                          <p className="mt-1 text-xs capitalize text-muted">
                            {loan.tool.category.replaceAll("_", " ")}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 font-medium text-foreground">
                        {loan.borrower?.name ?? "Unavailable"}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-foreground">
                          {loan.lender?.name ?? "Unavailable"}
                        </p>
                        {loan.lender?.email && (
                          <p className="mt-1 text-xs text-muted">
                            {loan.lender.email}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 text-muted">
                        {formatDate(loan.startDate)}
                      </td>

                      <td className="px-5 py-4 text-muted">
                        {formatDate(loan.dueDate)}
                      </td>

                      <td className="px-5 py-4">
                        {loan.isOverdue ? (
                          <StatusBadge status="overdue" />
                        ) : (
                          <StatusBadge status={loan.status} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                Showing {results.length} loaded loan records
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
                <span className="text-sm text-muted">
                  Loading more...
                </span>
              ) : (
                <span className="text-sm text-muted">
                  All matching loans loaded
                </span>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
