
"use client";

import { useMutation, usePaginatedQuery } from "convex/react";
import {
  ChevronDown,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "../../../../../../convex/_generated/api";


type RoleFilter = "all" | "admin" | "user";
type TrustedFilter = "all" | "trusted" | "not_trusted";

const PAGE_SIZES = [10, 20, 50];

function formatDate(timestamp?: number) {
  if (!timestamp) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(timestamp);
}

function getInitials(name?: string, email?: string) {
  const value = name?.trim() || email?.trim() || "U";

  return value
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [trusted, setTrusted] = useState<TrustedFilter>("all");
  const [pageSize, setPageSize] = useState(10);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<
    (typeof results)[number] | null
  >(null);
  const [confirmationError, setConfirmationError] = useState("");

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      role: role === "all" ? undefined : role,
      trusted:
        trusted === "all"
          ? undefined
          : trusted === "trusted",
    }),
    [search, role, trusted]
  );

  const {
    results,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.admin.getPaginatedUsers,
    filters,
    { initialNumItems: pageSize }
  );

  const grantTrustedLender = useMutation(
    api.admin.grantTrustedLender
  );

  const revokeTrustedLender = useMutation(
    api.admin.revokeTrustedLender
  );

  const isLoading = status === "LoadingFirstPage";
  const isLoadingMore = status === "LoadingMore";
  const canLoadMore = status === "CanLoadMore";

  async function handleTrustedAction() {
    if (!selectedUser) return;

    const user = selectedUser;
    const isTrusted = Boolean(user.isTrusted);

    setActionUserId(user._id);

    try {
      if (isTrusted) {
        await revokeTrustedLender({ userId: user._id });
      } else {
        await grantTrustedLender({
          userId: user._id,
          reason: "Granted by platform administrator",
        });
      }

      setSelectedUser(null);
    } catch (error) {
      console.error("Trusted Lender update failed:", error);

      // Keep the modal open and show the error inside it.
      setConfirmationError(
        error instanceof Error
          ? error.message
          : "Could not update Trusted Lender status."
      );
    } finally {
      setActionUserId(null);
    }
  }




  const adminCount = results.filter(
    (user) => user.role === "admin"
  ).length;

  const trustedCount = results.filter(
    (user) => user.isTrusted
  ).length;

  function resetFilters() {
    setSearch("");
    setRole("all");
    setTrusted("all");
    setPageSize(10);
  }

  return (
    <div className="space-y-7 pb-10">

      {/* Page heading */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-medium text-[#87958a]">
            <Users className="h-4 w-4" />
            <span>Administration</span>
            <span>/</span>
            <span className="text-[#23845e]">All Users</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-[#203b30] sm:text-3xl">
            User management
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#829087]">
            Manage community members, administrator permissions and Trusted
            Lender access.
          </p>
        </div>

        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-[#e1e9e1] bg-white px-4 text-sm font-semibold text-[#52675a] shadow-sm transition hover:border-[#cbdace] hover:bg-[#f7faf6] sm:self-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Reset filters
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          title="Users loaded"
          value={results.length}
          icon={<Users className="h-5 w-5" />}
          description="User records in the current results"
        />

        <SummaryCard
          title="Administrators"
          value={adminCount}
          icon={<Shield className="h-5 w-5" />}
          description="Administrator accounts in loaded results"
        />

        <SummaryCard
          title="Trusted lenders"
          value={trustedCount}
          icon={<ShieldCheck className="h-5 w-5" />}
          description="Trusted accounts in loaded results"
        />
      </div>

      {/* Search and filters */}
      <section className="overflow-hidden rounded-2xl border border-[#e5ebe5] bg-white shadow-sm">
        <div className="border-b border-[#edf1ed] px-5 py-4 sm:px-6">
          <h2 className="text-sm font-semibold text-[#203b30]">
            Find community members
          </h2>

          <p className="mt-1 text-xs text-[#89958c]">
            Search by name or email, then narrow down by account status.
          </p>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-[minmax(0,1fr)_190px_210px]">
          <div className="relative sm:col-span-2 xl:col-span-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa69d]" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users by name or email..."
              aria-label="Search users by name or email"
              className="h-11 w-full rounded-xl border border-[#e1e9e1] bg-[#fcfdfb] pl-10 pr-4 text-sm text-[#203b30] outline-none transition placeholder:text-[#a0aaa2] focus:border-[#23845e] focus:bg-white focus:ring-4 focus:ring-[#23845e]/10"
            />
          </div>

          <select
            value={role}
            onChange={(event) =>
              setRole(event.target.value as RoleFilter)
            }
            aria-label="Filter by role"
            className="h-11 w-full rounded-xl border border-[#e1e9e1] bg-[#fcfdfb] px-3 text-sm text-[#52675a] outline-none transition focus:border-[#23845e] focus:ring-4 focus:ring-[#23845e]/10"
          >
            <option value="all">All roles</option>
            <option value="admin">Administrators</option>
            <option value="user">Community users</option>
          </select>

          <select
            value={trusted}
            onChange={(event) =>
              setTrusted(event.target.value as TrustedFilter)
            }
            aria-label="Filter by Trusted Lender status"
            className="h-11 w-full rounded-xl border border-[#e1e9e1] bg-[#fcfdfb] px-3 text-sm text-[#52675a] outline-none transition focus:border-[#23845e] focus:ring-4 focus:ring-[#23845e]/10"
          >
            <option value="all">All lender statuses</option>
            <option value="trusted">Trusted lenders</option>
            <option value="not_trusted">Not trusted</option>
          </select>
        </div>
      </section>

      {/* Users table */}
      <section className="overflow-hidden rounded-2xl border border-[#e5ebe5] bg-white shadow-sm">

        {/* Table heading */}
        <div className="flex flex-col gap-4 border-b border-[#edf1ed] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-[#203b30]">
              Platform users
            </h2>

            <p className="mt-1 text-xs text-[#89958c]">
              Review account details, roles and trust permissions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[#89958c]">
              Rows per page
            </span>

            <select
              value={pageSize}
              onChange={(event) =>
                setPageSize(Number(event.target.value))
              }
              aria-label="Rows per page"
              className="h-9 rounded-lg border border-[#e1e9e1] bg-[#fcfdfb] px-3 text-sm font-medium text-[#52675a] outline-none focus:border-[#23845e]"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-[#829087]">
            <Loader2 className="h-5 w-5 animate-spin text-[#23845e]" />
            Loading community members...
          </div>
        ) : results.length === 0 ? (

          /* Empty state */
          <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf4ee] text-[#23845e]">
              <UserRound className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-[#203b30]">
              No users found
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-[#89958c]">
              No accounts match your current search and filters. Try changing
              your search criteria.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 text-sm font-semibold text-[#23845e] transition hover:text-[#176b4b]"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="border-b border-[#edf1ed] bg-[#f8faf7] text-[11px] font-semibold uppercase tracking-[0.08em] text-[#89958c]">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Trusted lender</th>
                    <th className="px-5 py-4">Joined</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#edf1ed]">
                  {results.map((user) => {
                    const isTrusted = Boolean(user.isTrusted);
                    const isUpdating = actionUserId === user._id;

                    return (
                      <tr
                        key={user._id}
                        className="transition-colors hover:bg-[#fafcf9]"
                      >
                        {/* User */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#dce9dd] bg-[#edf4ee] text-xs font-bold text-[#28734f]">
                              {getInitials(user.name, user.email)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[#203b30]">
                                {user._id || "Unnamed user"}
                              </p>


                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${user.role === "admin"
                              ? "bg-violet-50 text-violet-700"
                              : "bg-[#f1f4f0] text-[#65766a]"
                              }`}
                          >
                            {user.role === "admin" ? (
                              <Shield className="h-3.5 w-3.5" />
                            ) : (
                              <UserRound className="h-3.5 w-3.5" />
                            )}

                            {user.role === "admin" ? "Admin" : "User"}
                          </span>
                        </td>

                        {/* Trusted lender */}
                        <td className="px-5 py-4">
                          {isTrusted ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Trusted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#929d94]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#b7c0b8]" />
                              Not trusted
                            </span>
                          )}
                        </td>

                        {/* Joined date */}
                        <td className="whitespace-nowrap px-5 py-4 text-xs font-medium text-[#718477]">
                          {formatDate(user.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => {
                              setConfirmationError("");
                              setSelectedUser(user);
                            }}
                            className={`inline-flex min-w-[132px] items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${isTrusted
                              ? "border-red-100 bg-white text-red-600 hover:border-red-200 hover:bg-red-50"
                              : "border-[#d7e7d9] bg-[#f3f8f2] text-[#28734f] hover:border-[#b9d5bf] hover:bg-[#eaf4e9]"
                              }`}
                          >
                            {isUpdating ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <ShieldCheck className="h-3.5 w-3.5" />
                            )}

                            {isUpdating
                              ? "Updating..."
                              : isTrusted
                                ? "Revoke trust"
                                : "Make trusted"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-[#edf1ed] bg-[#fcfdfb] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-xs text-[#89958c]">
                Showing{" "}
                <span className="font-semibold text-[#203b30]">
                  {results.length}
                </span>{" "}
                loaded users
              </p>

              <button
                type="button"
                disabled={!canLoadMore || isLoadingMore}
                onClick={() => loadMore(pageSize)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#203b30] px-5 text-xs font-semibold text-white transition hover:bg-[#2c4d3d] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading users...
                  </>
                ) : canLoadMore ? (
                  <>
                    Load more users
                    <ChevronDown className="h-4 w-4" />
                  </>
                ) : (
                  "All users loaded"
                )}
              </button>
            </div>
          </>
        )}
      </section>

      {/* Trusted Lender Confirmation Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#e5ebe5] bg-white p-6 shadow-2xl">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf4ee] text-[#23845e]">
              {selectedUser.isTrusted ? (
                <Shield className="h-6 w-6" />
              ) : (
                <ShieldCheck className="h-6 w-6" />
              )}
            </div>

            <h2 className="mt-5 text-lg font-semibold text-[#203b30]">
              {selectedUser.isTrusted
                ? "Revoke Trusted Lender status?"
                : "Grant Trusted Lender status?"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#718477]">
              Are you sure you want to{" "}
              {selectedUser.isTrusted ? "revoke" : "grant"} Trusted Lender
              permissions for{" "}
              <span className="font-semibold text-[#203b30]">
                {selectedUser.name || selectedUser.email || "this user"}
              </span>
              ?
            </p>

            {confirmationError && (
              <p className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                {confirmationError}
              </p>
            )}

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                disabled={actionUserId !== null}
                onClick={() => {
                  setSelectedUser(null);
                  setConfirmationError("");
                }}
                className="rounded-xl border border-[#e1e9e1] px-4 py-2.5 text-sm font-semibold text-[#52675a] transition hover:bg-[#f7faf6] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={actionUserId !== null}
                onClick={handleTrustedAction}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 ${selectedUser.isTrusted
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[#23845e] hover:bg-[#176b4b]"
                  }`}
              >
                {actionUserId !== null && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {actionUserId !== null
                  ? "Updating..."
                  : selectedUser.isTrusted
                    ? "Revoke trust"
                    : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e5ebe5] bg-white p-5 shadow-sm transition-all duration-200 hover:border-[#cbdace] hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#718477]">
          {title}
        </p>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4ee] text-[#23845e]">
          {icon}
        </div>
      </div>

      <p className="mt-5 text-3xl font-semibold tracking-tight text-[#203b30] tabular-nums">
        {value}
      </p>

      <p className="mt-1.5 text-xs text-[#89958c]">
        {description}
      </p>
    </div>
  );
}
