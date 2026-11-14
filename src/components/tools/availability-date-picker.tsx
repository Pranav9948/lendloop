"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { DayPicker } from "react-day-picker";

type UnavailableRange = {
  startDate: number;
  endDate: number;
};

type Props = {
  label: string;
  value: string;
  minDate: string;
  onChange: (value: string) => void;
  unavailableRanges: UnavailableRange[];
  mode: "start" | "end";
  startDate?: string;
};

function parseLocalDate(value: string) {
  if (!value) return undefined;

  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfDay(timestamp: number) {
  const date = new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function AvailabilityDatePicker({
  label,
  value,
  minDate,
  onChange,
  unavailableRanges,
  mode,
  startDate,
}: Props) {
  const [open, setOpen] = useState(false);

  const selectedDate = parseLocalDate(value);
  const minimumDate = parseLocalDate(minDate);
  const selectedStartDate = parseLocalDate(startDate ?? "");

  function isUnavailable(date: Date) {
    return unavailableRanges.some((range) => {
      const rangeStart = startOfDay(range.startDate);
      const rangeEnd = startOfDay(range.endDate);

      return date >= rangeStart && date < rangeEnd;
    });
  }

  function isDisabled(date: Date) {
    if (minimumDate && date < minimumDate) return true;

    if (mode === "start") {
      return isUnavailable(date);
    }

    if (!selectedStartDate) return false;

    // The requested period is [startDate, endDate).
    // An end date equal to another booking's start date is allowed.
    return unavailableRanges.some((range) => {
      const rangeStart = startOfDay(range.startDate);
      const rangeEnd = startOfDay(range.endDate);

      return date > rangeStart
        ? selectedStartDate < rangeEnd && date > rangeStart
        : false;
    }) || unavailableRanges.some((range) => {
      const rangeStart = startOfDay(range.startDate);
      const rangeEnd = startOfDay(range.endDate);

      return selectedStartDate < rangeEnd && date > rangeStart;
    });
  }

  return (
    <div className="relative">
      <span className="mb-1.5 flex items-center gap-2 text-xs font-medium text-[#52675a]">
        <CalendarDays size={14} />
        {label}
      </span>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full items-center justify-between rounded-lg border border-[#e0e8df] bg-white px-3 text-left text-xs text-[#20352b] outline-none transition hover:border-[#167a5b] focus:ring-2 focus:ring-[#167a5b]/10"
      >
        <span className={value ? "text-[#20352b]" : "text-[#9aa69b]"}>
          {selectedDate
            ? selectedDate.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
            : "Choose a date"}
        </span>
        <CalendarDays size={15} className="text-[#879389]" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[min(320px,calc(100vw-48px))] rounded-xl border border-[#e0e8df] bg-white p-3 shadow-xl">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (!date) return;
              onChange(formatLocalDate(date));
              setOpen(false);
            }}
            disabled={isDisabled}
            modifiers={{
              unavailable: isUnavailable,
            }}
            modifiersClassNames={{
              unavailable: "availability-unavailable",
            }}
            showOutsideDays
            className="mx-auto"
            classNames={{
              month: "space-y-3",
              month_caption: "flex justify-center relative items-center h-9",
              caption_label: "text-sm font-semibold text-[#20352b]",
              nav: "flex items-center gap-1",
              button_previous:
                "absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-md text-[#52675a] hover:bg-[#f0f5ef]",
              button_next:
                "absolute right-0 top-1 flex h-7 w-7 items-center justify-center rounded-md text-[#52675a] hover:bg-[#f0f5ef]",
              month_grid: "w-full border-collapse",
              weekdays: "flex",
              weekday:
                "w-9 text-center text-[10px] font-medium text-[#9aa69b]",
              week: "mt-1 flex w-full",
              day: "flex h-9 w-9 items-center justify-center text-xs",
              day_button:
                "h-8 w-8 rounded-lg text-xs text-[#52675a] hover:bg-[#edf4ed] focus:outline-none focus:ring-2 focus:ring-[#167a5b]",
              selected:
                "[&>button]:bg-[#167a5b] [&>button]:text-white [&>button]:font-semibold",
              today: "[&>button]:font-bold [&>button]:text-[#167a5b]",
              outside: "[&>button]:text-[#c4ccc3]",
              disabled: "[&>button]:cursor-not-allowed [&>button]:opacity-30",
            }}
            components={{
              Chevron: ({ orientation }) =>
                orientation === "left" ? (
                  <ChevronLeft size={16} />
                ) : (
                  <ChevronRight size={16} />
                ),
            }}
          />

          <div className="mt-2 flex items-center gap-4 border-t border-[#edf0eb] pt-3 text-[10px] text-[#78867b]">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-red-500" />
              Unavailable
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[#167a5b]" />
              Selected
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
