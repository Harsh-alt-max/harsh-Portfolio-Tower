import Reveal from "./Reveal";
import { about } from "../content";

/** Two-column editorial about: sticky label left, serif statement + details right. */
export default function About() {
  return (
    <section
      id="about"
      className="border-t border-hairline px-6 py-24 md:px-12 md:py-36"
    >
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-32">
            <Reveal>
              <h2 className="text-[11px] font-medium uppercase tracking-[0.24em]">
                {about.kicker}
              </h2>
            </Reveal>
          </div>
        </div>

        <div className="md:col-span-8">
          <Reveal>
            <p className="max-w-3xl font-serif text-[clamp(1.5rem,3.2vw,2.6rem)] font-light leading-[1.28]">
              {about.bio}
            </p>
          </Reveal>

          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {about.details.map((d, i) => (
              <Reveal key={d.label} delay={i * 0.08}>
                <div className="border-t border-hairline pt-5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
                    {d.label}
                  </p>
                  <div className="mt-4 space-y-1.5 text-[15px] leading-relaxed">
                    {d.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
