"use client";

import { useQuery } from "convex/react";
import {
  ArrowRight,
  ChefHat,
  Drill,
  Leaf,
  LoaderCircle,
  Package,
  Tent,
} from "lucide-react";
import Link from "next/link";
import { api } from "../../../convex/_generated/api";

const categoryDetails = {
  power_tools: {
    label: "Power tools",
    icon: Drill,
  },
  garden: {
    label: "Garden",
    icon: Leaf,
  },
  kitchen: {
    label: "Kitchen",
    icon: ChefHat,
  },
  camping: {
    label: "Camping",
    icon: Tent,
  },
  other: {
    label: "Other",
    icon: Package,
  },
};

export function AvailableToolsSection() {
  const tools = useQuery(api.tools.getPublicTools);

  return (
    <section id="tools" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Explore the community
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Tools available to borrow
            </h2>

            <p className="mt-3 max-w-xl text-base leading-7 text-muted">
              Discover useful tools shared by members of your neighborhood.
            </p>
          </div>
        </div>

        {tools === undefined ? (
          <div className="flex min-h-48 items-center justify-center">
            <LoaderCircle className="animate-spin text-primary" size={32} />
            <span className="ml-3 text-sm text-muted">
              Loading available tools...
            </span>
          </div>
        ) : tools.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-background px-6 py-16 text-center">
            <Package className="mx-auto text-muted" size={36} />

            <h3 className="mt-4 text-lg font-semibold text-foreground">
              No tools available yet
            </h3>

            <p className="mt-2 text-sm text-muted">
              Be one of the first people to share a useful tool with your
              community.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool, index) => {
              const category = categoryDetails[tool.category];
              const Icon = category.icon;

              return (
                <article
                  key={`${tool.name}-${index}`}
                  className="rounded-2xl border border-border bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon size={24} />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-foreground">
                    {tool.name}
                  </h3>

                  <p className="mt-2 text-sm text-muted">{category.label}</p>

                  <div className="mt-5 border-t border-border pt-4">
                    <span className="text-xs font-medium text-primary">
                      Available in the community
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover"
          >
            Join the community
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
