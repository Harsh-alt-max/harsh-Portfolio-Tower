import { useEffect, useRef, useState } from "react";
import { gsap } from "../lib/gsap";
import { work } from "../content";
import Reveal from "./Reveal";

const finePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;

/** One editorial index row. Linked when a url exists, otherwise a quiet "forthcoming" state. */
function Row({ project }) {
  const linked = Boolean(project.url);
  const Tag = linked ? "a" : "div";

  return (
    <Tag
      {...(linked ? { href: project.url, target: "_blank", rel: "noreferrer" } : {})}
      data-cover={project.cover || ""}
      className="group block border-t border-hairline px-2 py-7 transition-colors duration-300 last:border-b hover:bg-paper-deep md:grid md:grid-cols-12 md:items-baseline md:gap-x-4 md:px-4 md:py-9"
    >
      <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted md:col-span-1">
        {project.index}
      </span>
      <h3 className="mt-2 font-serif text-[clamp(1.7rem,4vw,3rem)] font-light leading-[1.05] transition-transform duration-300 group-hover:translate-x-2 md:col-span-5 md:mt-0">
        {project.title}
      </h3>
      <div className="mt-3 flex items-baseline justify-between gap-4 md:col-span-6 md:mt-0">
        <p className="text-sm text-muted">{project.tags.join(" · ")}</p>
        <p className="text-sm text-muted">{project.year}</p>
        {linked ? (
          <span
            aria-hidden
            className="text-xl leading-none transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          >
            ↗
          </span>
        ) : (
          <span className="whitespace-nowrap rounded-full border border-hairline px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
            {work.forthcoming}
          </span>
        )}
      </div>
    </Tag>
  );
}

/**
 * Selected Work: editorial index rows with hairline rules.
 * On fine pointers, a small preview image follows the cursor
 * over rows that have artwork.
 */
export default function Work() {
  const previewRef = useRef(null);
  const imgRef = useRef(null);
  const [canHover] = useState(finePointer);

  // preload artwork so the preview never flashes
  useEffect(() => {
    work.projects.forEach((p) => {
      if (p.cover) {
        const img = new Image();
        img.src = p.cover;
      }
    });
  }, []);

  // cursor-follow with lerped motion
  useEffect(() => {
    if (!canHover || !previewRef.current) return;
    const xTo = gsap.quickTo(previewRef.current, "x", { duration: 0.5, ease: "power3" });
    const yTo = gsap.quickTo(previewRef.current, "y", { duration: 0.5, ease: "power3" });
    const onMove = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [canHover]);

  const showPreview = (cover) => {
    if (!canHover || !cover || !previewRef.current) return;
    if (imgRef.current) imgRef.current.src = cover;
    gsap.to(previewRef.current, { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" });
  };

  const hidePreview = () => {
    if (!previewRef.current) return;
    gsap.to(previewRef.current, { opacity: 0, scale: 0.94, duration: 0.3, ease: "power2.out" });
  };

  return (
    <section id="work" className="px-6 py-24 md:px-12 md:py-36">
      <Reveal>
        <div className="mb-10 flex items-baseline justify-between md:mb-14">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.24em]">
            {work.kicker}
          </h2>
          <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted">
            {work.count}
          </span>
        </div>
      </Reveal>

      <div onMouseLeave={hidePreview}>
        {work.projects.map((p) => (
          <div key={p.index} onMouseEnter={() => showPreview(p.cover)}>
            <Reveal>
              <Row project={p} />
            </Reveal>
          </div>
        ))}
      </div>

      {canHover && (
        <div
          ref={previewRef}
          className="pointer-events-none fixed left-0 top-0 z-[70] w-[300px] opacity-0"
          aria-hidden
        >
          <div className="aspect-[4/3] -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-paper-deep shadow-[0_24px_60px_-24px_rgba(25,23,19,0.35)]">
            <img ref={imgRef} alt="" className="h-full w-full object-cover" />
          </div>
        </div>
      )}
    </section>
  );
}
