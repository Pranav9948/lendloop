"use client";

import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-xl border border-border bg-white px-6 py-12 text-center"
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-50">
        <AlertCircle size={22} className="text-red-600" />
      </div>

      <h3 className="font-semibold text-foreground">{title}</h3>

      <p className="mt-2 max-w-md text-sm text-muted">{description}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          Try again
        </button>
      )}
    </div>
  );
}
