import { LoadingState } from "@/components/shared/loading-state";

export default function PublicLoading() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <LoadingState message="Loading LendLoop..." />
    </div>
  );
}
