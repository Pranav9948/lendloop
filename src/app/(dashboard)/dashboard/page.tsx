"use client";


import { LoadingState } from "@/components/shared/loading-state";
import { PageHeading } from "@/components/shared/page-heading";
import { SectionCard } from "@/components/shared/section-card";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const statCards = [
  {
    key: "activeCommunityTools",
    label: "Active Community Tools",
    description: "Tools currently listed by the community",
  },
  {
    key: "myListings",
    label: "My Listings",
    description: "Tools you have listed",
  },
  {
    key: "myRequests",
    label: "My Requests",
    description: "Borrowing requests you submitted",
  },
  {
    key: "incomingRequests",
    label: "Incoming Requests",
    description: "Requests received for your tools",
  },
  {
    key: "myLoans",
    label: "My Loans",
    description: "Loans where you are the borrower or lender",
  },
] as const;



export default function DashboardPage() {
  const overview = useQuery(api.dashboard.getOverview, {});


  if (overview === undefined) {
    return <LoadingState message="Loading your dashboard..." />;
  }

  return (
    <div>
      <PageHeading
        title={`Welcome, ${overview.name}`}
        description="Here's what's happening in your LendLoop community."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <SectionCard key={card.key} title={card.label}>
            <p className="text-3xl font-bold tabular-nums text-foreground">
              {overview.stats[card.key]}
            </p>

            <p className="mt-2 text-sm text-muted">{card.description}</p>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
