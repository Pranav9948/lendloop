"use client";

import { Package } from "lucide-react";
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 sm:flex-row">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white">
                <Package size={20} />
              </span>

              <span className="text-xl font-bold text-foreground">
                Lend<span className="text-primary">Loop</span>
              </span>
            </Link>

            <p className="mt-3 text-sm leading-6 text-muted">
              Borrow what you need. Lend what you don&apos;t. A simpler way to
              share useful tools with your community.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Explore</h3>

            <Link
              href="/#how-it-works"
              className="text-sm text-muted hover:text-primary"
            >
              How it works
            </Link>

            <Link
              href="/#tools"
              className="text-sm text-muted hover:text-primary"
            >
              Browse tools
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-center text-xs text-muted">
            © 2026 LendLoop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
