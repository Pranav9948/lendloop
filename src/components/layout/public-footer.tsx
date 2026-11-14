
"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  Package,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-[#e7ece6] bg-[#f7f8f4]">

      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-40 -top-40 size-[420px] rounded-full bg-[#e7f0e6]/60 blur-3xl" />

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16">

        {/* Main footer */}
        <div className="grid gap-14 py-16 sm:py-20 md:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr] lg:gap-20">

          {/* Brand */}
          <div className="max-w-md">
            <Link href="/" className="group inline-flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-[#167a5b] text-white shadow-lg shadow-[#167a5b]/15 transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105">
                <Package size={23} strokeWidth={1.8} />
              </span>

              <span className="text-2xl font-bold tracking-tight text-[#20352b]">
                Lend<span className="text-[#167a5b]">Loop</span>
              </span>
            </Link>

            <p className="mt-6 max-w-sm text-[15px] leading-7 text-[#718075]">
              Borrow what you need. Lend what you don&apos;t.
              A little sharing goes a long way towards building
              a more connected and resourceful community.
            </p>

            {/* Brand statement */}
            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#dce8dc] bg-white/70 px-4 py-2.5">
              <Heart size={14} className="fill-[#167a5b] text-[#167a5b]" />
              <span className="text-xs font-medium text-[#52675a]">
                Built around sharing, not owning.
              </span>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="mb-6 text-xs font-bold uppercase tracking-[0.18em] text-[#20352b]">
              Explore
            </h3>

            <div className="flex flex-col gap-4">
              {[
                { label: "Home", href: "/" },
                { label: "Browse tools", href: "/#tools" },
                { label: "How it works", href: "/#how-it-works" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group inline-flex w-fit items-center gap-2 text-sm text-[#718075] transition-colors duration-200 hover:text-[#167a5b]"
                >
                  {item.label}
                  <ArrowUpRight
                    size={13}
                    className="opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Community */}
          <div>
            <h3 className="mb-6 text-xs font-bold uppercase tracking-[0.18em] text-[#20352b]">
              Our community
            </h3>

            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#167a5b]">
                  <Package size={16} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#20352b]">
                    Share more
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#879389]">
                    Give useful things another purpose.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#167a5b]">
                  <ShieldCheck size={16} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#20352b]">
                    Build trust
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#879389]">
                    Make sharing part of everyday life.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-5 border-t border-[#e2e9e1] py-7 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-xs text-[#879389]">
            © 2026 LendLoop. All rights reserved.
          </p>

          <div className="flex items-center gap-2 text-xs text-[#718075]">
            Made for a world that shares
            <span className="font-serif italic text-[#167a5b]">
              a little more.
            </span>
            <ArrowRight size={13} className="text-[#167a5b]" />
          </div>

        </div>
      </div>
    </footer>
  );
}
