import { useEffect, useRef, useState } from "react";
import { site, ui } from "../content";

/** Vertical scroll-progress rail (right edge) with a live section label. */
function ScrollProgress({ night }) {
  const fillRef = useRef(null);
  const [section, setSection] = useState(ui.sections[0].label);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (fillRef.current)
        fillRef.current.style.transform = `scaleY(${p})`;
      const found =
        ui.sections.find((s) => p <= s.until) ??
        ui.sections[ui.sections.length - 1];
      setSection((prev) => (prev === found.label ? prev : found.label));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed right-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex">
      <div
        className={`relative h-[38vh] w-[2px] overflow-hidden rounded-full transition-colors duration-700 ${
          night ? "bg-white/15" : "bg-[#211d16]/15"
        }`}
      >
        <div
          ref={fillRef}
          className="absolute inset-0 origin-top bg-[#c9a06a]"
          style={{ transform: "scaleY(0)" }}
        />
      </div>
      <span
        className={`text-[10px] font-medium uppercase tracking-[0.3em] transition-colors duration-700 [writing-mode:vertical-rl] ${
          night ? "text-[#f2ede2]/70" : "text-[#211d16]/60"
        }`}
      >
        {section}
      </span>
    </div>
  );
}

/** Minimal chrome: corner labels, night toggle, hint pill, progress rail. */
export default function Chrome({ dimmed, night, onToggleNight }) {
  const pill =
    "rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] backdrop-blur-sm transition-colors duration-700";
  const dayPill = "bg-white/60 text-[#211d16]";
  const nightPill = "bg-[#12102a]/50 text-[#f2ede2] ring-1 ring-white/15";

  return (
    <>
      <div className="pointer-events-none absolute left-6 top-6 z-20 md:left-10 md:top-8">
        <p className={`${pill} ${night ? nightPill : dayPill}`}>
          {site.initials} — ©{site.year}
        </p>
      </div>

      <div className="pointer-events-none absolute right-6 top-6 z-20 flex items-start gap-2 md:right-10 md:top-8">
        <p
          className={`pointer-events-none hidden sm:block ${pill} ${
            night ? nightPill : dayPill
          }`}
        >
          {site.role}
        </p>
        <button
          type="button"
          onClick={onToggleNight}
          aria-pressed={night}
          className={`${pill} pointer-events-auto cursor-pointer transition-transform duration-300 hover:scale-[1.04] ${
            night ? nightPill : dayPill
          }`}
        >
          {night ? ui.day : ui.night}
        </button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center md:bottom-8">
        <p
          className={`rounded-full border px-5 py-2 text-[11px] font-medium uppercase tracking-[0.22em] backdrop-blur-sm transition-all duration-700 ${
            night
              ? "border-white/10 bg-[#12102a]/50 text-[#f2ede2]/80"
              : "border-[#211d16]/10 bg-[#f6f2e8]/70 text-[#211d16]/80"
          } ${dimmed ? "opacity-40" : "opacity-95"}`}
        >
          {site.hint}
        </p>
      </div>

      <ScrollProgress night={night} />
    </>
  );
}
