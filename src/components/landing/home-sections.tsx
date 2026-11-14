import { ArrowRight, Drill, Leaf, ShieldCheck, Tent, Wrench } from "lucide-react";

const categories = [
  { name: "Power tools", detail: "For the fix-it list", icon: Drill, tone: "bg-[#edf3e9] text-[#42694c]" },
  { name: "Garden", detail: "Grow a little more", icon: Leaf, tone: "bg-[#f2f1e5] text-[#687443]" },
  { name: "Hand tools", detail: "The right tool for the job", icon: Wrench, tone: "bg-[#f5eee3] text-[#94683b]" },
  { name: "Camping", detail: "Make room for outside", icon: Tent, tone: "bg-[#eaf0f0] text-[#456a68]" },
];

export function HomeSections() {
  return (
    <>

      <section id="tools" className="relative overflow-hidden bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16">

          {/* Heading */}
          <div className="mb-14 flex flex-col justify-between gap-8 lg:mb-16 lg:flex-row lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e1eae1] bg-[#f7faf6] px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-[#167a5b]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#167a5b]">
                  The neighborhood shelf
                </span>
              </div>

              <h2 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-[-0.055em] text-[#20352b] sm:text-5xl lg:text-6xl">
                Everything you need.
                <br />
                <span className="font-serif font-medium italic text-[#167a5b]">
                  Already around you.
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-base leading-7 text-[#718075] sm:text-lg">
                From weekend projects to everyday fixes, discover useful things
                your neighbors are happy to share.
              </p>
            </div>

            <a
              href="#how-it-works"
              className="group inline-flex min-h-12 shrink-0 items-center gap-3 self-start rounded-full bg-[#20352b] px-6 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#167a5b] lg:self-end"
            >
              Discover how it works
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          {/* Category grid */}
          <div className="grid gap-5 min-[520px]:grid-cols-2 lg:grid-cols-4">
            {categories.map(({ name, detail, icon: Icon, tone }, index) => (
              <article
                key={name}
                className="group relative flex min-h-[280px] flex-col overflow-hidden rounded-[28px] border border-[#e9eee8] bg-[#f8faf7] p-6 transition-all duration-500 hover:-translate-y-2 hover:border-[#c9dacb] hover:bg-[#f2f7f1] hover:shadow-[0_24px_55px_rgba(32,53,43,0.09)] sm:min-h-[310px] sm:p-7"
              >
                {/* Decorative background */}
                <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-white/70 transition-transform duration-500 group-hover:scale-150" />

                {/* Card header */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-[0.18em] text-[#a0aea2]">
                    CATEGORY 0{index + 1}
                  </span>
                  <ArrowRight
                    size={18}
                    className="text-[#b1beb2] transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[#167a5b]"
                  />
                </div>

                {/* Icon */}
                <div className="relative z-10 mt-9 flex size-[76px] items-center justify-center rounded-[24px] bg-white shadow-sm ring-1 ring-[#e9eee8] transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]">
                  <div className={`flex size-14 items-center justify-center rounded-[18px] ${tone}`}>
                    <Icon size={27} strokeWidth={1.7} />
                  </div>
                </div>

                {/* Text */}
                <div className="relative z-10 mt-auto pt-9">
                  <h3 className="text-xl font-semibold tracking-tight text-[#20352b]">
                    {name}
                  </h3>
                  <p className="mt-2 max-w-[220px] text-sm leading-6 text-[#78867b]">
                    {detail}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* Trust note */}
          <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-[#e9eee8] bg-[#fbfcfa] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e9f3e9] text-[#167a5b]">
                <ShieldCheck size={19} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#20352b]">
                  Shared by your community
                </p>
                <p className="mt-0.5 text-xs text-[#849087]">
                  Every listing comes from someone willing to share.
                </p>
              </div>
            </div>

            <p className="text-xs leading-5 text-[#849087] sm:max-w-[330px] sm:text-right">
              Categories are examples. Actual listings depend on what neighbors choose to share.
            </p>
          </div>

        </div>
      </section>



      <section id="how-it-works" className="relative overflow-hidden bg-[#f7f8f4] py-24 sm:py-28">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16">

          {/* Section heading */}
          <div className="mb-16 grid gap-8 md:grid-cols-2 md:items-end">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#dce9df] bg-white px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-[#167a5b]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#167a5b]">
                  Good things go around
                </span>
              </div>

              <h2 className="max-w-xl text-4xl font-semibold leading-[1.12] tracking-[-0.055em] text-[#20352b] sm:text-5xl lg:text-6xl">
                Sharing should be
                <br />
                <span className="font-serif font-medium italic text-[#167a5b]">
                  this simple.
                </span>
              </h2>
            </div>

            <div className="md:pb-2 md:pl-10">
              <p className="max-w-md text-base leading-7 text-[#718075] sm:text-lg">
                Borrow what you need, share what you have, and be part of a community
                where useful things never go to waste.
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="relative grid gap-5 md:grid-cols-3">

            {[
              {
                n: "01",
                tag: "DISCOVER",
                title: "Find what you need",
                body: "Explore tools shared by people in your community. Find the right item for your project and check when it's available.",
                icon: "⌕",
                detail: "Browse community listings"
              },
              {
                n: "02",
                tag: "CONNECT",
                title: "Request to borrow",
                body: "Choose your borrowing dates and send a request to the owner. Once approved, your borrowing journey begins.",
                icon: "↗",
                detail: "Send a borrowing request"
              },
              {
                n: "03",
                tag: "SHARE",
                title: "Borrow and return",
                body: "Make the most of your borrowed tool, take good care of it, and return it on time for the next person.",
                icon: "↻",
                detail: "Keep good things going"
              }
            ].map((step) => (
              <article
                key={step.n}
                className="group relative flex min-h-[330px] flex-col overflow-hidden rounded-[24px] border border-[#e3e9df] bg-white p-7 transition-all duration-300 hover:-translate-y-2 hover:border-[#b8d3c1] hover:shadow-[0_20px_50px_rgba(32,53,43,0.08)] sm:p-9"
              >
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <span className="font-serif text-5xl italic text-[#dce9df] transition-colors duration-300 group-hover:text-[#167a5b]">
                    {step.n}
                  </span>

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0f5ef] text-2xl text-[#167a5b] transition-all duration-300 group-hover:bg-[#167a5b] group-hover:text-white">
                    {step.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="mt-auto pt-12">
                  <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-[#167a5b]">
                    {step.tag}
                  </p>

                  <h3 className="text-xl font-semibold tracking-tight text-[#20352b] sm:text-2xl">
                    {step.title}
                  </h3>

                  <p className="mt-3 max-w-sm text-sm leading-7 text-[#718075]">
                    {step.body}
                  </p>
                </div>

                {/* Bottom detail */}
                <div className="mt-7 flex items-center gap-2 border-t border-[#edf0eb] pt-5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#167a5b]" />
                  <span className="text-xs font-medium text-[#718075]">
                    {step.detail}
                  </span>
                </div>
              </article>
            ))}
          </div>

          {/* Bottom message */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
            <span className="text-sm text-[#718075]">
              That&apos;s it. No complicated process.
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-[#167a5b] sm:block" />
            <span className="text-sm font-semibold text-[#167a5b]">
              Just a little sharing that goes a long way.
            </span>
          </div>

        </div>
      </section>

    </>
  );
}

