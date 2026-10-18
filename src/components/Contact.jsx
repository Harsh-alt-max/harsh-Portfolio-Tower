import { useEffect, useState } from "react";
import { scrollToSection } from "../lib/scroll";
import Reveal from "./Reveal";
import { contact, site } from "../content";

/** Live clock for Noida (Asia/Kolkata), ticking every second. */
function useNoidaClock() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/** Contact: a quiet question, one refined link, and a precise footer row. */
export default function Contact() {
  const time = useNoidaClock();

  return (
    <footer
      id="contact"
      className="border-t border-hairline px-6 pb-10 pt-24 md:px-12 md:pt-36"
    >
      <Reveal>
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted">
          {contact.kicker}
        </p>
      </Reveal>

      <Reveal delay={0.08}>
        <h2 className="mt-8 font-serif text-[clamp(2.8rem,8vw,7.5rem)] font-light leading-[1.02]">
          {contact.titleLines.map((l, i) => (
            <span key={i} className="block">
              {l.italic ? <em>{l.text}</em> : l.text}
            </span>
          ))}
        </h2>
      </Reveal>

      <Reveal delay={0.16}>
        <a
          href={site.behanceUrl}
          target="_blank"
          rel="noreferrer"
          className="group mt-12 inline-flex items-center gap-3 text-lg"
        >
          <span className="border-b border-ink/30 pb-1 transition-colors duration-300 group-hover:border-bronze group-hover:text-bronze">
            {contact.cta}
          </span>
          <span
            aria-hidden
            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          >
            ↗
          </span>
        </a>
      </Reveal>

      <div className="mt-24 flex flex-col gap-4 border-t border-hairline pt-6 text-[11px] font-medium uppercase tracking-[0.2em] text-muted md:flex-row md:items-center md:justify-between">
        <span>
          © {site.year} {site.name}
        </span>
        <span>Noida — {time}</span>
        <button
          onClick={() => scrollToSection("#top")}
          className="text-left transition-colors duration-300 hover:text-ink md:text-right"
        >
          {contact.backToTop}
        </button>
      </div>
    </footer>
  );
}
