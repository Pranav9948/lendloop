"use client";

import { useQuery } from "convex/react";
import {
  Handshake,
  Inbox,
  LayoutDashboard,
  Package,
  PlusSquare,
  Send,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "../../../convex/_generated/api";

const navigationItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "All Tools",
    href: "/dashboard/tools",
    icon: Package,
  },
  {
    label: "My Listings",
    href: "/dashboard/my-listings",
    icon: PlusSquare,
  },
  {
    label: "My Requests",
    href: "/dashboard/my-requests",
    icon: Send,
  },
  {
    label: "Incoming Requests",
    href: "/dashboard/incoming-requests",
    icon: Inbox,
  },
  {
    label: "My Loans",
    href: "/dashboard/my-loans",
    icon: Handshake,
  },
];

interface DashboardSidebarProps {
  onNavigate?: () => void;
}

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname();

  const profile = useQuery(api.users.getCurrentUserProfile);

  const isAdmin = profile?.role === "admin";

  return (
    <aside className="flex h-full w-[17rem] shrink-0 flex-col border-r border-border bg-white">
      {/* Brand */}
      <Link href={"/dashboard"}>
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white">
            <Package size={21} />
          </span>

          <span className="text-xl font-bold tracking-tight text-foreground">
            Lend<span className="text-primary">Loop</span>
          </span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Workspace
        </p>

        {navigationItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${isActive
                ? "bg-primary/10 text-primary"
                : "text-muted hover:bg-gray-50 hover:text-foreground"
                }`}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {profile === undefined ? null : isAdmin ? (
          <div className="pt-6">
            <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
              Administration
            </p>

            <Link
              href="/dashboard/admin"
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${pathname === "/dashboard/admin" ||
                pathname.startsWith("/dashboard/admin/")
                ? "bg-primary/10 text-primary"
                : "text-muted hover:bg-gray-50 hover:text-foreground"
                }`}
            >
              <ShieldCheck size={19} />
              <span>Admin Dashboard</span>
            </Link>
          </div>
        ) : null}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <p className="text-xs text-muted">LendLoop Community</p>
      </div>
    </aside>
  );
}
