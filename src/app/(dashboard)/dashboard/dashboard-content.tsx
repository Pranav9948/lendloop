
"use client";

import { LoadingState } from "@/components/shared/loading-state";
import { useQuery } from "convex/react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  ClipboardList,
  Handshake,
  Package,
  PackagePlus,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { api } from "../../../../convex/_generated/api";

const statCards = [
  {
    key: "activeCommunityTools",
    label: "Community tools",
    description: "Available across your community",
    icon: Boxes,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
    accent: "border-emerald-100",
    href: "/dashboard/tools",
  },
  {
    key: "myListings",
    label: "My listings",
    description: "Tools you've shared",
    icon: Package,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-700",
    accent: "border-blue-100",
    href: "/dashboard/my-listings",
  },
  {
    key: "myRequests",
    label: "My requests",
    description: "Items you've requested",
    icon: ClipboardList,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-700",
    accent: "border-violet-100",
    href: "/dashboard/my-requests",
  },
  {
    key: "incomingRequests",
    label: "Incoming requests",
    description: "Requests for your tools",
    icon: Users,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-700",
    accent: "border-amber-100",
    href: "/dashboard/incoming-requests",
  },
  {
    key: "myLoans",
    label: "My loans",
    description: "Your active borrowing activity",
    icon: Handshake,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-700",
    accent: "border-rose-100",
    href: "/dashboard/my-loans",
  },
] as const;

export default function DashboardContent() {
  const overview = useQuery(api.dashboard.getOverview, {});

  if (overview === undefined) {
    return <LoadingState message="Preparing your workspace..." />;
  }

  return (
    <div className="space-y-9 pb-10">

      {/* Welcome section */}
      <section className="relative overflow-hidden rounded-[28px] bg-[#203b30] px-6 py-8 text-white shadow-sm sm:px-9 sm:py-10">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-16 -top-32 size-80 rounded-full border-[45px] border-white/[0.04]" />
        <div className="pointer-events-none absolute -bottom-32 right-36 size-64 rounded-full bg-[#167a5b]/30 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
              <Sparkles size={13} className="text-emerald-300" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
                Your LendLoop workspace
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Welcome back, {overview.name}
              <span className="text-emerald-300">.</span>
            </h1>

            <p className="mt-3 max-w-lg text-sm leading-7 text-white/65 sm:text-base">
              Here&apos;s what&apos;s happening in your community.
              Discover useful tools, manage your listings, and keep sharing.
            </p>
          </div>

          <Link
            href="/dashboard/tools"
            className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#203b30] transition-all hover:bg-emerald-50"
          >
            Explore tools
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>

      {/* Statistics heading */}
      <section>
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Your overview
            </h2>
            <p className="mt-1 text-sm text-muted">
              A snapshot of your sharing activity.
            </p>
          </div>

          <span className="text-xs font-medium text-muted">
            Community statistics
          </span>
        </div>

        {/* Statistics cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.key}
                href={card.href}
                className={`group block rounded-2xl border ${card.accent} bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(32,53,43,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#167a5b] focus-visible:ring-offset-2 sm:p-6`}
              >
                <div className="flex items-start justify-between">
                  <div className={`flex size-11 items-center justify-center rounded-xl ${card.iconBg} ${card.iconColor}`}>
                    <Icon size={21} strokeWidth={1.8} />
                  </div>

                  <ArrowUpRight
                    size={17}
                    className="text-[#c1cbc2] transition-colors group-hover:text-[#167a5b]"
                  />
                </div>

                <div className="mt-7">
                  <p className="text-3xl font-semibold tracking-[-0.04em] tabular-nums text-foreground">
                    {overview.stats[card.key]}
                  </p>

                  <h3 className="mt-2 text-sm font-semibold text-[#35483b]">
                    {card.label}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-muted">
                    {card.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section >

      {/* Quick actions */}
      <section >
        <div className="mb-5">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Quick actions
          </h2>
          <p className="mt-1 text-sm text-muted">
            What would you like to do today?
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">

          {/* Browse tools */}
          <Link
            href="/dashboard/tools"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-[#dce9df] bg-[#f2f7f2] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#b9d5c0] hover:shadow-md sm:p-7"
          >
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#167a5b] shadow-sm">
                <Package size={23} />
              </div>

              <div>
                <h3 className="font-semibold text-[#20352b]">
                  Browse community tools
                </h3>
                <p className="mt-1 text-xs leading-5 text-[#718075]">
                  Find something useful for your next project.
                </p>
              </div>
            </div>

            <ArrowRight
              size={19}
              className="shrink-0 text-[#167a5b] transition-transform group-hover:translate-x-1"
            />
          </Link>

          {/* List a tool */}
          <Link
            href="/dashboard/my-listings"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-[#e9e5d9] bg-[#faf8f2] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#dfd2af] hover:shadow-md sm:p-7"
          >
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#9b7936] shadow-sm">
                <PackagePlus size={23} />
              </div>

              <div>
                <h3 className="font-semibold text-[#20352b]">
                  Share a tool
                </h3>
                <p className="mt-1 text-xs leading-5 text-[#718075]">
                  List something you are happy to lend.
                </p>
              </div>
            </div>

            <ArrowRight
              size={19}
              className="shrink-0 text-[#9b7936] transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section >

      {/* Community message */}
      <div className="flex items-center gap-3 rounded-2xl border border-[#e8eee8] bg-white px-5 py-4" >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eaf3e9] text-[#167a5b]">
          <Activity size={17} />
        </div>

        <p className="text-xs leading-6 text-[#718075]">
          Every tool shared is an opportunity to help someone in your
          community. <span className="font-semibold text-[#167a5b]">Keep the good things going.</span>
        </p>
      </div >

    </div >
  );
}
