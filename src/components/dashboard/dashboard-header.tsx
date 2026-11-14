"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}


export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  return (
    <header className="flex min-h-20 items-center justify-between border-b border-border bg-white px-5 py-4 sm:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="rounded-lg p-2 text-foreground hover:bg-gray-100 lg:hidden"
        >
          <Menu size={22} />
        </button>
      </div>

      <UserButton />
    </header>
  );
}
