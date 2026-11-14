import { LoadingState } from "@/components/shared/loading-state";

export default function DashboardLoading() {
  return (
    <div className="p-5 sm:p-8">
      <LoadingState message="Loading your LendLoop workspace..." />
    </div>
  );
}
