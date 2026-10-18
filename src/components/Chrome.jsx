import { site } from "../content";

/** Minimal chrome: ink corner labels + hint pill, readable against the sky. */
export default function Chrome({ dimmed }) {
  return (
    <>
      <div className="pointer-events-none absolute left-6 top-6 z-20 md:left-10 md:top-8">
        <p className="rounded-full bg-white/55 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-[#211d16] backdrop-blur-sm">
          {site.initials} — ©{site.year}
        </p>
      </div>
      <div className="pointer-events-none absolute right-6 top-6 z-20 md:right-10 md:top-8">
        <p className="rounded-full bg-white/55 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-[#211d16] backdrop-blur-sm">
          {site.role}
        </p>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center md:bottom-8">
        <p
          className={`rounded-full border border-[#211d16]/10 bg-[#f6f2e8]/70 px-5 py-2 text-[11px] uppercase tracking-[0.22em] text-[#211d16]/70 backdrop-blur-sm transition-opacity duration-1000 ${
            dimmed ? "opacity-40" : "opacity-95"
          }`}
        >
          {site.hint}
        </p>
      </div>
    </>
  );
}
