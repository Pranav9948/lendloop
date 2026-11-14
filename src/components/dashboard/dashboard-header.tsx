
"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu, Search } from "lucide-react";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#edf0eb] bg-white/80 px-5 backdrop-blur-2xl sm:px-8 lg:px-10">

      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="flex size-10 items-center justify-center rounded-xl text-[#52675a] transition-all duration-200 hover:bg-[#f2f6f1] hover:text-[#167a5b] lg:hidden"
        >
          <Menu size={22} strokeWidth={1.8} />
        </button>

        <div className="hidden sm:block">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#a0aca1]">
            Your space
          </p>
          <h2 className="mt-0.5 text-[15px] font-semibold tracking-tight text-[#20352b]">
            Share more. Own less.
          </h2>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">

        <button
          type="button"
          aria-label="Search"
          className="flex size-10 items-center justify-center rounded-full text-[#718075] transition-colors hover:bg-[#f4f7f3] hover:text-[#167a5b]"
        >
          <Search size={19} strokeWidth={1.8} />
        </button>

        <div className="mx-1 h-7 w-px bg-[#edf0eb]" />

        <div className="rounded-full border border-[#e9eee8] p-0.5 transition-shadow hover:shadow-sm">
          <UserButton />
        </div>

      </div>
    </header>
  );
}
