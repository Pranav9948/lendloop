import { ArrowDown, ArrowRight, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="overflow-hidden bg-[#f7f8f4]">
      <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[0.88fr_1.12fr] lg:gap-10 lg:px-12 lg:py-20 xl:px-16">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#167a5b]/15 bg-white/80 px-3.5 py-2 shadow-sm">
            <span className="flex size-6 items-center justify-center rounded-full bg-[#e7f1e8] text-[#167a5b]"><Leaf size={14} /></span>
            <span className="text-xs font-semibold tracking-wide text-[#20352b] sm:text-sm">GOOD NEIGHBORS SHARE</span>
          </div>
          <h1 className="max-w-[650px] text-[clamp(2.7rem,11vw,5.8rem)] font-semibold leading-[0.99] tracking-[-0.065em] text-[#20352b] sm:text-[clamp(3.5rem,7vw,5.8rem)]">
            Big projects.
            <span className="mt-1 block font-serif font-medium italic tracking-[-0.055em] text-[#167a5b]">No big purchases.</span>
          </h1>
          <p className="mt-6 max-w-[490px] text-base leading-7 text-[#647268] sm:mt-7 sm:text-lg sm:leading-8">
            The right tool might be just around the corner. Borrow from your neighbors, lend what you have, and get more out of the things we already own.
          </p>
          <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row sm:mt-8">
            <a href="#tools" className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#167a5b] px-6 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(22,122,91,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#116449] sm:px-7">
              Find your next tool <ArrowRight className="transition-transform group-hover:translate-x-1" size={17} />
            </a>
            <a href="#how-it-works" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-[#dce4dd] bg-white/75 px-6 text-sm font-semibold text-[#20352b] transition-colors hover:bg-white sm:px-7">
              How it works <ArrowDown size={16} />
            </a>
          </div>
          <div className="mt-8 flex items-center gap-3 text-sm text-[#68766c] sm:mt-9">
            <span className="flex size-9 items-center justify-center rounded-full bg-[#e6efe7] text-[#167a5b]"><ShieldCheck size={18} /></span>
            <span>Neighbor-powered sharing, on your terms.</span>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[760px] lg:ml-auto">
          <div className="absolute -right-14 -top-16 size-64 rounded-full bg-[#e5eddf] blur-3xl" />
          <div className="relative h-[340px] overflow-hidden rounded-[1.6rem] bg-[#dfe8dc] shadow-[0_28px_70px_rgba(32,53,43,0.14)] sm:h-[480px] sm:rounded-[2rem] lg:h-[540px]">
            <Image src="/images/lendloop-community-hero.png" alt="Neighbors sharing a cordless drill in a sunny garden" fill priority sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#15271e]/45 via-transparent to-[#15271e]/5" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-8 sm:left-8 sm:right-8">
              <div className="max-w-xs text-white">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75 sm:text-xs">A little closer to home</p>
                <p className="mt-2 text-xl font-medium leading-tight tracking-tight sm:text-3xl">Good things happen when we share.</p>
              </div>
              <span className="hidden size-12 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur sm:flex"><Sparkles size={20} /></span>
            </div>
          </div>
          <div className="absolute -left-2 top-5 flex items-center gap-2.5 rounded-2xl border border-white/80 bg-white/95 px-3 py-2.5 shadow-[0_12px_35px_rgba(32,53,43,0.12)] sm:-left-8 sm:top-10 sm:gap-3 sm:px-5 sm:py-4">
            <span className="flex size-9 items-center justify-center rounded-full bg-[#e8f1e8] text-[#167a5b] sm:size-10"><Leaf size={18} /></span>
            <div><p className="text-[11px] font-medium text-[#79847a] sm:text-xs">Share locally</p><p className="mt-0.5 text-xs font-semibold text-[#25392e] sm:text-sm">Make more, together</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
