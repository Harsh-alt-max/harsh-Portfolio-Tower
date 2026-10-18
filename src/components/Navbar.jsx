import { useEffect, useState } from "react";
import { scrollToSection } from "../lib/scroll";
import { site, nav } from "../content";

/** Fixed nav: transparent at the top, hairline border + blur once scrolled. */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[90] transition-all duration-500 ${
        scrolled
          ? "border-b border-hairline bg-paper/90 backdrop-blur-sm"
          : "border-b border-transparent"
      }`}
    >
      <nav className="flex items-center justify-between px-6 py-5 md:px-12">
        <button
          onClick={() => scrollToSection("#top")}
          className="text-[11px] font-medium uppercase tracking-[0.22em]"
        >
          {site.initials} <span className="text-muted">— ©{site.year}</span>
        </button>
        <ul className="flex items-center gap-5 md:gap-8">
          {nav.links.map((l) => (
            <li key={l.target}>
              <button
                onClick={() => scrollToSection(l.target)}
                className="group relative text-[11px] font-medium uppercase tracking-[0.22em] text-ink/75 transition-colors duration-300 hover:text-ink"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-bronze transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100" />
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
