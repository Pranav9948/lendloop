
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
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { api } from "../../../convex/_generated/api";

interface DashboardSidebarProps {
  onNavigate?: () => void;
}

const userNavigation = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "All Tools", href: "/dashboard/tools", icon: Package },
  { label: "My Listings", href: "/dashboard/my-listings", icon: PlusSquare },
  { label: "My Requests", href: "/dashboard/my-requests", icon: Send },
  {
    label: "Incoming Requests",
    href: "/dashboard/incoming-requests",
    icon: Inbox,
  },
  { label: "My Loans", href: "/dashboard/my-loans", icon: Handshake },
];

const adminNavigation = [
  { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "All Tools", href: "/dashboard/admin/tools", icon: Package },
  { label: "All Loans", href: "/dashboard/admin/loans", icon: Handshake },
  { label: "All Users", href: "/dashboard/admin/users", icon: Users },
];

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname();
  const profile = useQuery(api.users.getCurrentUserProfile);

  const isAdmin = profile?.role === "admin";
  const navigationItems = isAdmin ? adminNavigation : userNavigation;

  return (
    <aside className="flex h-full w-[17rem] shrink-0 flex-col border-r border-border bg-white">
      <Link href={isAdmin ? "/dashboard/admin" : "/dashboard"} onClick={onNavigate}>
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white">
            {isAdmin ? (
              <ShieldCheck size={21} />
            ) : (
              <Package size={21} />
            )}
          </span>

          <span className="text-xl font-bold tracking-tight text-foreground">
            Lend<span className="text-primary">Loop</span>
          </span>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
          {isAdmin ? "Administration" : "Workspace"}
        </p>

        {navigationItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
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
      </nav>

      <div className="border-t border-border p-4">
        <p className="text-xs text-muted">
          {isAdmin ? "LendLoop Administration" : "LendLoop Community"}
        </p>
      </div>
    </aside>
  );
}
