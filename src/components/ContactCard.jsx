import { contact, site } from "../content";

/**
 * Quiet centered contact card — fades in at the top of the scroll journey
 * (p > 0.88), fades out when scrolling back. Never blocks tower clicks
 * while hidden.
 */
export default function ContactCard({ visible }) {
  return (
    <div
      className={`fixed inset-0 z-30 flex items-center justify-center transition-opacity duration-700 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        className={`rounded-2xl border border-[#211d16]/10 bg-[#f6f2e8]/90 px-10 py-8 text-center shadow-2xl backdrop-blur-md transition-all duration-700 md:px-14 md:py-10 ${
          visible ? "translate-y-0" : "translate-y-6"
        }`}
      >
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#8a8474]">
          {contact.kicker}
        </p>
        <h2 className="mt-3 font-serif text-4xl font-light leading-tight text-[#211d16] md:text-5xl">
          {contact.title}
        </h2>
        <a
          href={site.behanceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block rounded-full bg-[#211d16] px-7 py-2.5 text-[12px] uppercase tracking-[0.22em] text-[#f6f2e8] transition-opacity hover:opacity-80"
        >
          {contact.cta}
        </a>
      </div>
    </div>
  );
}
