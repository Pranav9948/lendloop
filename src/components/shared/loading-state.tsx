interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-xl border border-border bg-white p-8"
    >
      <div className="size-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />

      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}
