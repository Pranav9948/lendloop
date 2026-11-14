import {
  ArrowRight,
  Drill,
  Leaf,
  Package,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import Link from "next/link";

const featuredTools = [
  {
    name: "Power Drill",
    category: "Power tools",
    icon: Drill,
    color: "bg-blue-50 text-blue-600",
  },
  {
    name: "Garden Kit",
    category: "Gardening",
    icon: Leaf,
    color: "bg-green-50 text-green-600",
  },
  {
    name: "Toolbox",
    category: "Hand tools",
    icon: Wrench,
    color: "bg-orange-50 text-orange-600",
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:px-8">
        {/* Left: Hero content */}
        <div className="relative z-10">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
            <span className="size-2 rounded-full bg-primary" />
            <span className="text-sm font-semibold text-primary">
              Share more. Own less.
            </span>
          </div>

          <h1 className="max-w-xl text-5xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Borrow what you need.
            <span className="mt-2 block text-primary">
              Lend what you don&apos;t.
            </span>
          </h1>

          <p className="mt-7 max-w-lg text-base leading-8 text-muted sm:text-lg">
            Your neighborhood has tools you need. Share useful equipment, borrow
            from people nearby, and make better use of what we already own.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
            >
              Get started
              <ArrowRight size={18} />
            </Link>

            <Link
              href="#tools"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-white px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-gray-50"
            >
              Explore tools
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-3 text-sm text-muted">
            <ShieldCheck size={20} className="shrink-0 text-primary" />
            <span>Community sharing with user-controlled listings</span>
          </div>
        </div>

        {/* Right: Illustrative tool-sharing visual */}
        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -inset-8 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative rounded-3xl border border-border bg-white p-6 shadow-xl sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">
                  The sharing community
                </p>
                <h2 className="mt-1 text-xl font-bold text-foreground">
                  Useful things, shared.
                </h2>
              </div>

              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Package size={25} />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {featuredTools.map((tool) => {
                const Icon = tool.icon;

                return (
                  <div
                    key={tool.name}
                    className="flex items-center gap-4 rounded-2xl border border-border p-4 transition-transform hover:translate-x-1"
                  >
                    <div
                      className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${tool.color}`}
                    >
                      <Icon size={23} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground">
                        {tool.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted">{tool.category}</p>
                    </div>

                    <div className="ml-auto">
                      <ArrowRight size={18} className="text-muted" />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl bg-primary/5 p-5">
              <p className="text-sm font-semibold text-foreground">
                One community. More possibilities.
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Borrow responsibly and help useful tools reach more people.
              </p>
            </div>
          </div>

          <div className="absolute -bottom-6 -left-5 hidden rounded-2xl border border-border bg-white p-4 shadow-lg sm:block">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck size={21} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  Built for trust
                </p>
                <p className="text-xs text-muted">Community first</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
