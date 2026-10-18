import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";
import { hero } from "../content";

/** Full-viewport editorial hero. Lines rise softly once the loader lifts. */
export default function Hero({ ready }) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-hero-line]",
        { yPercent: 115 },
        { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.12, delay: 0.1 }
      );
      gsap.fromTo(
        "[data-hero-fade]",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.1, delay: 0.5 }
      );
    }, rootRef);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section
      id="top"
      ref={rootRef}
      className="relative flex min-h-svh flex-col justify-between px-6 pb-10 pt-32 md:px-12"
    >
      <div>
        <p
          data-hero-fade
          className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted opacity-0"
        >
          {hero.kicker}
        </p>
        <h1 className="mt-8 font-serif text-[clamp(3.4rem,11vw,10.5rem)] font-light leading-[0.98] tracking-[-0.01em]">
          {hero.titleLines.map((line, i) => (
            <span key={i} className="block overflow-hidden pb-[0.08em]">
              <span data-hero-line className={`block ${line.italic ? "italic" : ""}`}>
                {line.text}
              </span>
            </span>
          ))}
        </h1>
        <p
          data-hero-fade
          className="mt-8 max-w-md text-base leading-relaxed text-muted opacity-0 md:text-lg"
        >
          {hero.sub}
        </p>
      </div>

      <div data-hero-fade className="flex items-end justify-between opacity-0">
        <p className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-ink/70">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-bronze" />
          {hero.availability}
        </p>
        <p className="flex flex-col items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
          {hero.scrollHint}
          <span className="scroll-line block h-12 w-px bg-ink/25" aria-hidden />
        </p>
      </div>
    </section>
  );
}
