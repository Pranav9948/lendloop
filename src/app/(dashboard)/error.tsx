"use client";

import { ErrorState } from "@/components/shared/error-state";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  console.error("Dashboard error:", error);

  return (
    <div className="p-5 sm:p-8">
      <ErrorState
        title="Unable to load this page"
        description="An unexpected error occurred. Please try again."
        onRetry={reset}
      />
    </div>
  );
}
