
"use client";

import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";

import {
  ArrowRight,
  Menu,
  Package,
  Sparkles,
  X,
} from "lucide-react";

import Link from "next/link";
import { useState } from "react";

const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Browse tools", href: "/#tools" },
];

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8eee8]/80 bg-white/90 backdrop-blur-2xl">

      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12 xl:px-16">

        {/* Brand */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="group flex shrink-0 items-center gap-2.5"
        >
          <span className="flex size-11 items-center justify-center rounded-[15px] bg-[#167a5b] text-white shadow-md shadow-[#167a5b]/15 transition-all duration-300 group-hover:-rotate-6 group-hover:scale-105">
            <Package size={23} strokeWidth={1.8} />
          </span>

          <span className="text-[23px] font-bold tracking-[-0.06em] text-[#20352b]">
            Lend<span className="text-[#167a5b]">Loop</span>
          </span>
        </Link>

        {/* Desktop Navigation */}


        <nav className="hidden items-center gap-8 md:flex">
          {navigationLinks.map((link, index) => (
            <Link
              key={link.label}
              href={link.href}
              className={`group relative py-2 text-[14px] font-semibold tracking-[-0.01em] transition-colors duration-200 ${index === 0
                ? "text-[#167a5b]"
                : "text-[#718075] hover:text-[#20352b]"
                }`}
            >
              {link.label}

              <span
                className={`absolute -bottom-0.5 left-0 h-[2px] rounded-full bg-[#167a5b] transition-all duration-300 ${index === 0
                  ? "w-full"
                  : "w-0 group-hover:w-full"
                  }`}
              />
            </Link>
          ))}
        </nav>


        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoaded ? (
            isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="group inline-flex h-11 items-center gap-2 rounded-full bg-[#167a5b] px-5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#126449] hover:shadow-lg hover:shadow-[#167a5b]/15"
                >
                  Dashboard
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <UserButton />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="h-11 rounded-full px-5 text-sm font-semibold text-[#52675a] transition-colors hover:bg-[#f4f7f2] hover:text-[#167a5b]">
                    Sign in
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button className="group inline-flex h-11 items-center gap-2 rounded-full bg-[#167a5b] px-5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#126449] hover:shadow-lg hover:shadow-[#167a5b]/15">
                    Get started
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>
                </SignUpButton>
              </>
            )
          ) : (
            <div className="h-10 w-28 animate-pulse rounded-full bg-[#f0f3ef]" />
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex size-10 items-center justify-center rounded-xl border border-[#e8eee8] bg-[#f8faf7] text-[#20352b] transition-colors hover:bg-[#edf4ec] md:hidden"
        >
          {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        id="mobile-navigation"
        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-in-out md:hidden ${mobileMenuOpen
          ? "grid-rows-[1fr] opacity-100"
          : "grid-rows-[0fr] opacity-0"
          }`}
      >
        <div className="min-h-0">
          <div className="border-t border-[#e8eee8] bg-white px-5 pb-6 pt-5 sm:px-8">

            {/* Mobile navigation links */}
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a0ada2]">
              Navigation
            </p>

            <nav className="flex flex-col gap-1">
              {navigationLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-[#52675a] transition-colors hover:bg-[#f3f7f1] hover:text-[#167a5b]"
                >
                  {link.label}
                  <ArrowRight size={15} className="text-[#a5b2a6]" />
                </Link>
              ))}
            </nav>

            {/* Mobile authentication */}
            {isLoaded && (
              <div className="mt-5 border-t border-[#edf0eb] pt-5">
                {isSignedIn ? (
                  <div className="flex items-center justify-between gap-4">
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#167a5b] px-5 text-sm font-semibold text-white"
                    >
                      Dashboard
                      <ArrowRight size={15} />
                    </Link>

                    <UserButton />
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <SignUpButton mode="modal">
                      <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#167a5b] text-sm font-semibold text-white transition-colors hover:bg-[#126449]"
                      >
                        Get started
                        <ArrowRight size={15} />
                      </button>
                    </SignUpButton>

                    <SignInButton mode="modal">
                      <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex h-12 items-center justify-center rounded-full border border-[#e5ebe4] text-sm font-semibold text-[#52675a] transition-colors hover:bg-[#f7f9f6]"
                      >
                        Sign in
                      </button>
                    </SignInButton>
                  </div>
                )}
              </div>
            )}

            {/* Mobile brand message */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#879389]">
              <Sparkles size={13} className="text-[#167a5b]" />
              A little sharing goes a long way.
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
