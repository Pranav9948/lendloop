type StatusBadgeProps = {
  status: string;
};

const statusStyles: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-blue-50 text-blue-700",
  declined: "bg-red-50 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
  returned: "bg-green-50 text-green-700",
  archived: "bg-gray-100 text-gray-600",
  processing: "bg-blue-50 text-blue-700",
  succeeded: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-700",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();

  const styles = statusStyles[normalizedStatus] ?? "bg-gray-100 text-gray-600";

  const label = normalizedStatus.replaceAll("_", " ");

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize ${styles}`}
    >
      {label}
    </span>
  );
}
