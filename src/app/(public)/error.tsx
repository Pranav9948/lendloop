"use client";

import { ErrorState } from "@/components/shared/error-state";

interface PublicErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PublicError({ error, reset }: PublicErrorProps) {
  console.error("Public page error:", error);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <ErrorState
        title="Unable to load LendLoop"
        description="We couldn't load this page right now. Please try again."
        onRetry={reset}
      />
    </div>
  );
}
