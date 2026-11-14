
"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { AvailabilityDatePicker } from "@/components/tools/availability-date-picker";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowRight,
  Check,
  Package,
  Search,
  ShieldCheck,
  X
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

const PAGE_SIZE = 8;

const categories = [
  { label: "All tools", value: "all" },
  { label: "Power tools", value: "power_tools" },
  { label: "Garden", value: "garden" },
  { label: "Kitchen", value: "kitchen" },
  { label: "Camping", value: "camping" },
  { label: "Other", value: "other" },
] as const;

const categoryLabels: Record<string, string> = {
  power_tools: "Power tools",
  garden: "Garden",
  kitchen: "Kitchen",
  camping: "Camping",
  other: "Other",
};

export default function AllToolsPage() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [selectedToolId, setSelectedToolId] =
    useState<Id<"tools"> | null>(null);

  const tools = useQuery(api.tools.getAllActiveTools, {
    category:
      category === "all"
        ? undefined
        : (category as
          | "power_tools"
          | "garden"
          | "kitchen"
          | "camping"
          | "other"),
  });

  const createBorrowRequest = useMutation(
    api.borrowRequests.createBorrowRequest
  );

  const currentUser = useQuery(api.users.getCurrentUserProfile);



  const availability = useQuery(
    api.borrowRequests.getUnavailableDates,
    selectedToolId
      ? { toolId: selectedToolId }
      : "skip"
  );

  // Search within the tools returned by Convex
  const filteredTools = useMemo(() => {
    if (!tools) return [];

    const query = search.trim().toLowerCase();

    if (!query) return tools;

    return tools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        (categoryLabels[tool.category] ?? "Other")
          .toLowerCase()
          .includes(query)
    );
  }, [tools, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTools.length / PAGE_SIZE),
  );

  const paginatedTools = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;

    return filteredTools.slice(
      startIndex,
      startIndex + PAGE_SIZE,
    );
  }, [filteredTools, currentPage]);

  // Tomorrow's date in local calendar time
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const minStartDate = [
    tomorrow.getFullYear(),
    String(tomorrow.getMonth() + 1).padStart(2, "0"),
    String(tomorrow.getDate()).padStart(2, "0"),
  ].join("-");

  async function handleBorrowRequest(toolId: Id<"tools">) {
    if (!startDate || !endDate) {
      setActionError("Please select both borrowing dates.");
      return;
    }

    const startTimestamp = new Date(
      `${startDate}T00:00:00`
    ).getTime();

    const endTimestamp = new Date(
      `${endDate}T00:00:00`
    ).getTime();

    if (startTimestamp <= new Date().setHours(0, 0, 0, 0)) {
      setActionError("Please select a future start date.");
      return;
    }

    if (endTimestamp <= startTimestamp) {
      setActionError("End date must be after start date.");
      return;
    }

    setBusy(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await createBorrowRequest({
        toolId,
        startDate: startTimestamp,
        endDate: endTimestamp,
      });

      setActionSuccess("Your borrowing request was submitted successfully.");
      setSelectedToolId(null);
      setStartDate("");
      setEndDate("");
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to submit your borrow request."
      );
    } finally {
      setBusy(false);
    }
  }

  function openBorrowForm(toolId: Id<"tools">) {
    setSelectedToolId(toolId);
    setStartDate("");
    setEndDate("");
    setActionError(null);
    setActionSuccess(null);
  }

  function closeBorrowForm() {
    setSelectedToolId(null);
    setStartDate("");
    setEndDate("");
    setActionError(null);
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-8 pb-12">

      {/* Marketplace heading */}
      <section className="border-b border-[#e9eee8] pb-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#167a5b]">
              <span className="size-2 rounded-full bg-[#167a5b]" />
              The neighborhood shelf
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.045em] text-[#20352b] sm:text-4xl">
              Find your next useful thing.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#78867b]">
              Discover tools shared by your community.
              Borrow what you need and give useful things another life.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#78867b]">
            <ShieldCheck size={16} className="text-[#167a5b]" />
            Community-powered sharing
          </div>
        </div>
      </section>

      {/* Notifications */}
      {actionError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {actionSuccess && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <div className="flex items-center gap-2">
            <Check size={17} />
            {actionSuccess}
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            aria-label="Dismiss success message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Search */}
      <section>
        <div className="relative max-w-2xl">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a197]"
          />

          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search drills, gardening tools, kitchen equipment..."
            className="h-13 w-full rounded-xl border border-[#e4eae3] bg-white pl-12 pr-12 text-sm text-[#20352b] outline-none transition-all placeholder:text-[#a2ada3] focus:border-[#167a5b] focus:ring-4 focus:ring-[#167a5b]/5"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a197] hover:text-[#167a5b]"
            >
              <X size={17} />
            </button>
          )}
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#20352b]">
            Browse categories
          </h2>
          <span className="text-xs text-[#94a197]">
            Choose a category
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((item) => {
            const active = category === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setCategory(item.value);
                  setCurrentPage(1);
                  closeBorrowForm();
                }}
                className={`shrink-0 rounded-lg border px-4 py-2.5 text-xs font-semibold transition-all ${active
                  ? "border-[#203b30] bg-[#203b30] text-white"
                  : "border-[#e7ece6] bg-white text-[#718075] hover:border-[#b8d2bd] hover:text-[#167a5b]"
                  }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Product listing */}
      <section>
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[#20352b]">
              Explore tools
            </h2>
            <p className="mt-1 text-xs text-[#879389]">
              Useful things, shared by people around you.
            </p>
          </div>

          {tools !== undefined && (
            <p className="text-xs font-medium text-[#78867b]">
              {filteredTools.length}{" "}
              {filteredTools.length === 1 ? "item" : "items"} available
            </p>
          )}
        </div>

        {tools === undefined ? (
          <LoadingState message="Loading community tools..." />
        ) : filteredTools.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#dce5dc] bg-[#fafcf9] px-5 py-16">
            <EmptyState
              title={search ? "No matching tools" : "No tools found"}
              description={
                search
                  ? "Try a different search term or category."
                  : "There are no active tools in this category yet."
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedTools.map((tool) => {
              const isSelected = selectedToolId === tool._id;
              const isOwner = currentUser?._id === tool.ownerId;

              return (
                <article
                  key={tool._id}
                  className="group min-w-0"
                >
                  {/* Product image */}
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#f3f5f1]">
                    {tool.imageUrl ? (
                      <Image
                        src={tool.imageUrl}
                        alt={tool.name}
                        width={600}
                        height={450}
                        unoptimized
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-[#a0ada2]">
                        <Package size={34} strokeWidth={1.3} />
                        <span className="text-xs">
                          No photograph available
                        </span>
                      </div>
                    )}

                    <div className="absolute left-3 top-3">
                      <span className="rounded-md bg-white/95 px-2.5 py-1.5 text-[10px] font-semibold text-[#52675a] shadow-sm backdrop-blur">
                        {categoryLabels[tool.category] ?? "Other"}
                      </span>
                    </div>

                    <div className="absolute right-3 top-3">
                      <StatusBadge status={tool.status} />
                    </div>
                  </div>

                  {/* Product information */}
                  <div className="pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold tracking-tight text-[#20352b] transition-colors group-hover:text-[#167a5b]">
                        {tool.name}
                      </h3>
                    </div>

                    <p className="mt-1.5 line-clamp-2 min-h-10 text-xs leading-5 text-[#879389]">
                      {tool.description}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[11px] text-[#9aa69b]">
                        Condition
                      </span>
                      <span className="text-[11px] font-semibold capitalize text-[#52675a]">
                        {tool.condition.replaceAll("_", " ")}
                      </span>
                    </div>

                    {/* Borrow button */}



                    <div className="mt-4">


                      {/* Borrow option - only for other users' listings */}
                      {!isOwner ? (
                        <div className="mt-4">
                          {!isSelected ? (
                            <button
                              type="button"
                              onClick={() => openBorrowForm(tool._id)}
                              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#167a5b] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#126449]"
                            >
                              Request to borrow
                              <ArrowRight size={15} />
                            </button>
                          ) : (
                            <div className="rounded-xl border border-[#dce8df] bg-[#f8faf7] p-4">
                              <div className="mb-4 flex items-center justify-between">
                                <div>
                                  <h4 className="text-sm font-semibold text-[#20352b]">
                                    Borrowing period
                                  </h4>
                                  <p className="mt-1 text-[11px] text-[#879389]">
                                    Select your preferred dates.
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={closeBorrowForm}
                                  aria-label="Close date selection"
                                  className="rounded-lg p-1.5 text-[#879389] hover:bg-[#edf2ec]"
                                >
                                  <X size={16} />
                                </button>
                              </div>

                              {availability === undefined ? (
                                <div className="rounded-lg border border-[#e0e8df] bg-white px-3 py-4 text-center text-xs text-[#879389]">
                                  Checking tool availability...
                                </div>
                              ) : (
                                <>
                                  <AvailabilityDatePicker
                                    label="Start date"
                                    mode="start"
                                    value={startDate}
                                    minDate={minStartDate}
                                    onChange={(value) => {
                                      setStartDate(value);

                                      if (endDate && endDate <= value) {
                                        setEndDate("");
                                      }

                                      setActionError(null);
                                    }}
                                    unavailableRanges={availability.unavailableRanges}
                                  />

                                  <AvailabilityDatePicker
                                    label="End date"
                                    mode="end"
                                    value={endDate}
                                    minDate={
                                      startDate
                                        ? (() => {
                                          const date = new Date(`${startDate}T00:00:00`);
                                          date.setDate(date.getDate() + 1);
                                          return [
                                            date.getFullYear(),
                                            String(date.getMonth() + 1).padStart(2, "0"),
                                            String(date.getDate()).padStart(2, "0"),
                                          ].join("-");
                                        })()
                                        : minStartDate
                                    }
                                    startDate={startDate}
                                    onChange={(value) => {
                                      setEndDate(value);
                                      setActionError(null);
                                    }}
                                    unavailableRanges={availability.unavailableRanges}
                                  />
                                </>
                              )}

                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleBorrowRequest(tool._id)}
                                className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#167a5b] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#126449] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {busy ? (
                                  "Submitting..."
                                ) : (
                                  <>
                                    Confirm request
                                    <ArrowRight size={14} />
                                  </>
                                )}
                              </button>

                              <p className="mt-3 text-center text-[10px] leading-4 text-[#929e93]">
                                The owner must approve your request.
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-4 rounded-lg border border-[#dce8df] bg-[#f1f6f0] px-4 py-3 text-center">
                          <span className="text-xs font-semibold text-[#167a5b]">
                            Your listing
                          </span>
                        </div>
                      )}



                    </div>

                  </div>
                </article>
              );
            })}
          </div>
        )}

        {filteredTools.length > PAGE_SIZE && (
          <div className="mt-10 flex flex-col gap-4 border-t border-[#e9eee8] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#879389]">
              Showing{" "}
              <span className="font-semibold text-[#20352b]">
                {(currentPage - 1) * PAGE_SIZE + 1}
              </span>
              {" – "}
              <span className="font-semibold text-[#20352b]">
                {Math.min(
                  currentPage * PAGE_SIZE,
                  filteredTools.length,
                )}
              </span>
              {" of "}
              <span className="font-semibold text-[#20352b]">
                {filteredTools.length}
              </span>{" "}
              tools
            </p>

            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((page) => Math.max(1, page - 1))
                }
                className="flex h-10 items-center gap-1 rounded-lg border border-[#e4eae3] bg-white px-4 text-xs font-semibold text-[#52675a] transition hover:bg-[#f3f7f2] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span>←</span>
                Previous
              </button>

              <span className="min-w-16 text-center text-xs font-semibold text-[#52675a]">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1),
                  )
                }
                className="flex h-10 items-center gap-1 rounded-lg border border-[#e4eae3] bg-white px-4 text-xs font-semibold text-[#52675a] transition hover:bg-[#f3f7f2] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <span>→</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Bottom message */}
      <div className="flex items-center justify-center gap-2 border-t border-[#edf0eb] pt-7 text-xs text-[#929e93]">
        <ShieldCheck size={14} className="text-[#167a5b]" />
        Share responsibly. Return things with care.
      </div>
    </div>
  );
}
