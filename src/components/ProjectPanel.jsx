import { panel } from "../content";

/**
 * Project detail panel. Slides in from the right on desktop,
 * becomes a bottom sheet on mobile.
 */
export default function ProjectPanel({ project, onClose }) {
  const open = project != null;
  return (
    <aside
      className={`fixed z-40 border border-[#c9a06a]/25 bg-[#141311]/95 backdrop-blur-md transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:right-0 md:top-0 md:h-full md:w-[400px] md:overflow-y-auto max-md:inset-x-3 max-md:bottom-3 max-md:max-h-[68vh] max-md:overflow-y-auto max-md:rounded-2xl ${
        open
          ? "md:translate-x-0 max-md:translate-y-0"
          : "md:translate-x-[110%] max-md:translate-y-[130%]"
      }`}
    >
      {project && (
        <div className="flex min-h-full flex-col p-8 md:p-10">
          <div className="flex items-start justify-between border-b border-white/10 pb-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#c9a06a]">
              {project.index}
            </p>
            <button
              onClick={onClose}
              className="text-[11px] uppercase tracking-[0.22em] text-white/50 transition-colors hover:text-white"
            >
              {panel.close} ✕
            </button>
          </div>

          <h2 className="mt-6 font-serif text-4xl font-light leading-[1.05] text-[#ece7db] md:text-5xl">
            {project.title}
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-white/60">
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
                className="rounded-full border border-white/15 px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-white/70"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {project.tools.map((t) => (
              <span
                key={t}
                className="rounded-full border border-[#c9a06a]/30 px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-[#c9a06a]/90"
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
                className="group inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.22em] text-[#c9a06a] transition-opacity hover:opacity-80"
              >
                {panel.viewOnBehance}
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </a>
            ) : (
              <p className="text-[12px] uppercase tracking-[0.24em] text-white/35">
                {panel.forthcoming}
              </p>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
