import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-white px-6 py-12 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-gray-100">
        <Inbox size={22} className="text-muted" />
      </div>

      <h3 className="font-semibold text-foreground">{title}</h3>

      <p className="mt-2 max-w-md text-sm text-muted">{description}</p>
    </div>
  );
}
