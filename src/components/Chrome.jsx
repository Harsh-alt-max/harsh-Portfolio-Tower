import { site } from "../content";

/** Minimal chrome: corner labels + hint pill. */
export default function Chrome({ dimmed }) {
  return (
    <>
      <div className="pointer-events-none absolute left-6 top-6 z-20 md:left-10 md:top-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#ece7db]/70">
          {site.initials} — ©{site.year}
        </p>
      </div>
      <div className="pointer-events-none absolute right-6 top-6 z-20 text-right md:right-10 md:top-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#ece7db]/70">
          {site.role}
        </p>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center md:bottom-8">
        <p
          className={`rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-[11px] uppercase tracking-[0.22em] text-[#ece7db]/60 backdrop-blur-sm transition-opacity duration-1000 ${
            dimmed ? "opacity-40" : "opacity-90"
          }`}
        >
          {site.hint}
        </p>
      </div>
    </>
  );
}
