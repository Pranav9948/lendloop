
"use client";

import { useQuery } from "convex/react";
import {
  Activity,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock3,
  Handshake,
  Package,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";

import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeading } from "@/components/shared/page-heading";
import { api } from "../../../../../convex/_generated/api";

const statCards = [
  {
    key: "totalUsers",
    label: "Total members",
    description: "Registered community members",
    icon: Users,
    href: "/dashboard/admin/users",
  },
  {
    key: "activeTools",
    label: "Active tools",
    description: "Currently listed tools",
    icon: Package,
    href: "/dashboard/admin/tools",
  },
  {
    key: "totalLoans",
    label: "Total loans",
    description: "All recorded borrowing activity",
    icon: Handshake,
    href: "/dashboard/admin/loans",
  },
  {
    key: "activeLoans",
    label: "Active loans",
    description: "Items currently on loan",
    icon: Activity,
    href: "/dashboard/admin/loans",
  },
  {
    key: "returnedLoans",
    label: "Returned loans",
    description: "Successfully completed loans",
    icon: CheckCircle2,
    href: "/dashboard/admin/loans",
  },
  {
    key: "trustedLenders",
    label: "Trusted lenders",
    description: "Members with trusted status",
    icon: ShieldCheck,
    href: "/dashboard/admin/users",
  },
  {
    key: "overdueLoans",
    label: "Overdue loans",
    description: "Active loans past their due date",
    icon: Clock3,
    href: "/dashboard/admin/loans",
  },
] as const;

const managementLinks = [
  {
    title: "Manage tools",
    description: "Search listings, review details and archive inappropriate listings.",
    href: "/dashboard/admin/tools",
    icon: Boxes,
  },
  {
    title: "Manage loans",
    description: "Monitor active, returned and overdue borrowing activity.",
    href: "/dashboard/admin/loans",
    icon: Handshake,
  },
  {
    title: "Manage members",
    description: "Review member accounts and manage trusted-lender status.",
    href: "/dashboard/admin/users",
    icon: Users,
  },
];

export default function AdminDashboardPage() {
  const profile = useQuery(api.users.getCurrentUserProfile);

  const overview = useQuery(
    api.admin.getAdminOverview,
    profile?.role === "admin" ? {} : "skip",
  );

  if (profile === undefined) {
    return <LoadingState message="Loading admin dashboard..." />;
  }

  if (!profile || profile.role !== "admin") {
    return (
      <div className="space-y-5">
        <PageHeading
          title="Admin overview"
          description="Administration dashboard"
        />
        <ErrorState
          title="Access denied"
          description="You do not have permission to access this page."
        />
      </div>
    );
  }

  if (overview === undefined) {
    return <LoadingState message="Loading platform statistics..." />;
  }

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-IN").format(value);

  return (
    <div className="space-y-8">
      <PageHeading
        title="Overview"
        description="Monitor platform activity and manage the LendLoop community."
      />

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted">
              Platform administration
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              Welcome to LendLoop
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
              Your central place to monitor members, tool listings and
              borrowing activity across the platform.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Admin access
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Platform statistics
            </h2>
            <p className="mt-1 text-sm text-muted">
              Current totals across your platform
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const value = overview[stat.key];

            return (
              <Link
                key={stat.key}
                href={stat.href}
                className="group rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-xl bg-muted/60 p-3 text-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted transition group-hover:translate-x-1 group-hover:text-foreground" />
                </div>

                <p className="mt-5 text-sm font-medium text-muted">
                  {stat.label}
                </p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                  {formatNumber(value)}
                </p>
                <p className="mt-2 text-xs text-muted">
                  {stat.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Management
          </h2>
          <p className="mt-1 text-sm text-muted">
            Go directly to an administration section
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {managementLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-muted/60 p-3 text-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted transition group-hover:translate-x-1 group-hover:text-foreground" />
                </div>

                <h3 className="mt-5 font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted">
                  {item.description}
                </p>
                <span className="mt-4 text-sm font-medium text-primary">
                  Open section
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
