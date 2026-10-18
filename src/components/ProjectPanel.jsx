import { panel } from "../content";

/**
 * Project detail panel — LIGHT theme. Slides in from the right on desktop,
 * becomes a bottom sheet on mobile. Ivory card, ink serif title, hairlines.
 */
export default function ProjectPanel({ project, onClose }) {
  const open = project != null;
  return (
    <aside
      className={`fixed z-40 border border-[#211d16]/10 bg-[#f6f2e8]/95 shadow-2xl backdrop-blur-md transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:right-0 md:top-0 md:h-full md:w-[400px] md:overflow-y-auto max-md:inset-x-3 max-md:bottom-3 max-md:max-h-[68vh] max-md:overflow-y-auto max-md:rounded-2xl ${
        open
          ? "md:translate-x-0 max-md:translate-y-0"
          : "md:translate-x-[110%] max-md:translate-y-[130%]"
      }`}
    >
      {project && (
        <div className="flex min-h-full flex-col p-8 md:p-10">
          <div className="flex items-start justify-between border-b border-[#211d16]/10 pb-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#9a7b4f]">
              {project.index}
            </p>
            <button
              onClick={onClose}
              className="text-[11px] uppercase tracking-[0.22em] text-[#211d16]/50 transition-colors hover:text-[#211d16]"
            >
              {panel.close} ✕
            </button>
          </div>

          <h2 className="mt-6 font-serif text-4xl font-light leading-[1.05] text-[#211d16] md:text-5xl">
            {project.title}
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-[#211d16]/65">
            {project.desc}
          </p>

          {project.cover && (
            <img
              src={project.cover}
              alt={project.title}
              loading="lazy"
              className="mt-6 w-full rounded-lg object-cover"
            />
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-[#211d16]/15 px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-[#211d16]/70"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {project.tools.map((t) => (
              <span
                key={t}
                className="rounded-full border border-[#9a7b4f]/40 px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-[#9a7b4f]"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-auto pt-10">
            {project.url ? (
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.22em] text-[#9a7b4f] transition-opacity hover:opacity-75"
              >
                {panel.viewOnBehance}
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </a>
            ) : (
              <p className="text-[12px] uppercase tracking-[0.24em] text-[#211d16]/40">
                {panel.forthcoming}
              </p>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
