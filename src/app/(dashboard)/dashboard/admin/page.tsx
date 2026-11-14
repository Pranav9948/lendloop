"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeading } from "@/components/shared/page-heading";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

const statCards = [
  { key: "totalUsers", label: "Total Members" },
  { key: "activeTools", label: "Active Tools" },
  { key: "totalLoans", label: "Total Loans" },
  { key: "activeLoans", label: "Active Loans" },
  { key: "returnedLoans", label: "Returned Loans" },
  { key: "trustedLenders", label: "Trusted Lenders" },
  { key: "overdueLoans", label: "Overdue Loans" },
] as const;

export default function AdminDashboardPage() {
  const profile = useQuery(api.users.getCurrentUserProfile);
  const [busyToolId, setBusyToolId] = useState<string | null>(null);
  const [toolActionError, setToolActionError] = useState("");
  const [toolActionSuccess, setToolActionSuccess] = useState("");

  const trustedLenderData = useQuery(
    api.admin.getTrustedLenderManagementData,
    profile?.role === "admin" ? {} : "skip",
  );

  const grantTrustedLender = useMutation(api.admin.grantTrustedLender);
  const revokeTrustedLender = useMutation(api.admin.revokeTrustedLender);

  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const overview = useQuery(
    api.admin.getAdminOverview,
    profile?.role === "admin" ? {} : "skip",
  );

  const allTools = useQuery(
    api.admin.getAllToolsWithDetails,
    profile?.role === "admin" ? {} : "skip",
  );

  const removeAnyTool = useMutation(api.admin.removeAnyTool);

  const loans = useQuery(
    api.admin.getAllLoansWithDetails,
    profile?.role === "admin" ? {} : "skip",
  );

  if (
    profile === undefined ||
    (profile?.role === "admin" && overview === undefined)
  ) {
    return <LoadingState message="Loading administration dashboard..." />;
  }

  if (
    profile === undefined ||
    (profile?.role === "admin" &&
      (overview === undefined || loans === undefined))
  ) {
    return <LoadingState message="Loading administration dashboard..." />;
  }

  if (
    profile === undefined ||
    (profile?.role === "admin" &&
      (overview === undefined ||
        loans === undefined ||
        trustedLenderData === undefined ||
        allTools === undefined))
  ) {
    return <LoadingState message="Loading administration dashboard..." />;
  }

  if (!profile || profile.role !== "admin") {
    return (
      <div>
        <PageHeading
          title="Admin Dashboard"
          description="Administrative access is restricted."
        />

        <ErrorState
          title="Access denied"
          description="You do not have permission to view this dashboard."
        />
      </div>
    );
  }

  async function handleTrustedLenderToggle(
    userId: Id<"users">,
    isTrusted: boolean,
  ) {
    setBusyUserId(userId);
    setActionError(null);

    try {
      if (isTrusted) {
        await revokeTrustedLender({ userId });
      } else {
        await grantTrustedLender({
          userId,
          reason: "Granted through the LendLoop admin dashboard",
        });
      }
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to update trusted-lender status.",
      );
    } finally {
      setBusyUserId(null);
    }
  }


  async function handleArchiveTool(toolId: Id<"tools">) {
    const confirmed = window.confirm(
      "Are you sure you want to archive this listing?",
    );

    if (!confirmed) return;

    setBusyToolId(toolId);
    setToolActionError("");
    setToolActionSuccess("");

    try {
      await removeAnyTool({ toolId });
      setToolActionSuccess("Tool listing archived successfully.");
    } catch (error) {
      setToolActionError(
        error instanceof Error
          ? error.message
          : "Failed to archive tool listing.",
      );
    } finally {
      setBusyToolId(null);
    }
  }

  return (
    <div>
      <PageHeading
        title="Admin Dashboard"
        description="Monitor the LendLoop community."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <SectionCard key={card.key} title={card.label}>
            <p className="text-3xl font-bold tabular-nums text-foreground">
              {overview![card.key]}
            </p>
          </SectionCard>
        ))}
      </div>


      <div className="mt-8">
        <SectionCard
          title="All Tools"
          description="View and manage every tool listing across the LendLoop community."
        >
          {toolActionError && (
            <p
              role="alert"
              className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {toolActionError}
            </p>
          )}

          {toolActionSuccess && (
            <p
              role="status"
              className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700"
            >
              {toolActionSuccess}
            </p>
          )}

          {allTools!.length === 0 ? (
            <EmptyState
              title="No tools found"
              description="Tool listings will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted">
                    <th className="px-3 py-3">Tool</th>
                    <th className="px-3 py-3">Owner</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Condition</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {allTools!.map((tool) => (
                    <tr key={tool._id} className="border-b border-border">
                      <td className="px-3 py-4 font-medium text-foreground">
                        {tool.name}
                      </td>

                      <td className="px-3 py-4">
                        {tool.owner?.name ?? "Unavailable"}
                      </td>

                      <td className="px-3 py-4">
                        {tool.owner?.email ?? "Not provided"}
                      </td>

                      <td className="px-3 py-4 capitalize">
                        {tool.category}
                      </td>

                      <td className="px-3 py-4 capitalize">
                        {tool.condition}
                      </td>

                      <td className="px-3 py-4">
                        <StatusBadge status={tool.status} />
                      </td>

                      <td className="px-3 py-4">
                        {tool.status === "active" ? (
                          <button
                            type="button"
                            disabled={busyToolId !== null}
                            onClick={() => handleArchiveTool(tool._id)}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {busyToolId === tool._id
                              ? "Archiving..."
                              : "Archive"}
                          </button>
                        ) : (
                          <span className="text-xs text-muted">
                            Archived
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>

      <div className="mt-8">
        <SectionCard
          title="All Loans"
          description="Review borrowing activity across the LendLoop community."
        >
          {loans!.length === 0 ? (
            <EmptyState
              title="No loans recorded"
              description="Approved borrowing activity will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted">
                    <th className="px-3 py-3">Tool</th>
                    <th className="px-3 py-3">Borrower</th>
                    <th className="px-3 py-3">Lender</th>
                    <th className="px-3 py-3">Due Date</th>
                    <th className="px-3 py-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {loans!.map((loan) => (
                    <tr key={loan._id} className="border-b border-border">
                      <td className="px-3 py-4 font-medium">
                        {loan.tool?.name ?? "Unavailable"}
                      </td>

                      <td className="px-3 py-4">
                        {loan.borrower?.name ?? "Unavailable"}
                      </td>

                      <td className="px-3 py-4">
                        <p className="font-medium text-foreground">
                          {loan.lender?.name ?? "Unavailable"}
                        </p>

                        {loan.lender?.email && (
                          <p className="mt-1 text-xs text-muted">
                            {loan.lender.email}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        {new Date(loan.dueDate).toLocaleDateString()}
                      </td>

                      <td className="px-3 py-4">
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
          )}
        </SectionCard>
      </div>

      <div className="mt-8">
        <SectionCard
          title="Trusted Lenders"
          description="Grant or revoke trusted-lender status for community members."
        >
          {actionError && (
            <p
              role="alert"
              className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {actionError}
            </p>
          )}

          {trustedLenderData!.length === 0 ? (
            <EmptyState
              title="No community members"
              description="Registered members will appear here."
            />
          ) : (
            <div className="space-y-3">
              {trustedLenderData!.map((member) => (
                <div
                  key={member._id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border p-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{member.name}</p>

                    {member.email && (
                      <p className="mt-1 break-all text-xs text-muted">
                        {member.email}
                      </p>
                    )}

                    <div className="mt-2">
                      <StatusBadge
                        status={member.isTrusted ? "active" : "cancelled"}
                      />
                      <span className="ml-2 text-xs text-muted">
                        {member.isTrusted
                          ? "Trusted lender"
                          : "Standard member"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={busyUserId !== null}
                    onClick={() =>
                      handleTrustedLenderToggle(member._id, member.isTrusted)
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${member.isTrusted
                      ? "border border-border text-foreground hover:bg-gray-50"
                      : "bg-primary text-white hover:bg-primary-hover"
                      }`}
                  >
                    {busyUserId === member._id
                      ? "Updating..."
                      : member.isTrusted
                        ? "Revoke status"
                        : "Grant status"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
