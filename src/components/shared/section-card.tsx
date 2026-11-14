import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function SectionCard({
  title,
  description,
  action,
  children,
}: SectionCardProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_2px_12px_rgba(23,43,37,0.035)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-6 py-5">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>

          {description && (
            <p className="mt-1 text-sm text-muted">{description}</p>
          )}
        </div>

        {action}
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
}
