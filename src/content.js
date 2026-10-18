// ============================================================
//  EDIT ME — every word on the site lives in this one file.
//  To change text: edit only what's between the quotes " ".
//  Don't touch anything else (no commas, brackets or code).
//  Save, and the site rebuilds itself in 2–3 minutes.
// ============================================================

export const site = {
  name: "Harsh Kumar Singh",
  initials: "HKS",
  year: "2026",
  behanceUrl: "https://www.behance.net/harsh19_",
};

export const nav = {
  links: [
    { label: "Work", target: "#work" },
    { label: "About", target: "#about" },
    { label: "Contact", target: "#contact" },
  ],
};

export const loader = {
  name: "Harsh Kumar Singh",
};

export const hero = {
  kicker: "Harsh Kumar Singh — Motion Designer, Noida",
  titleLines: [{ text: "Motion," }, { text: "composed.", italic: true }],
  sub: "I'm Harsh — a motion designer at Inshorts, crafting interfaces and stories that move.",
  availability: "Available for select projects",
  scrollHint: "Scroll",
};

export const work = {
  kicker: "Selected Work",
  count: "(04)",
  forthcoming: "Forthcoming",
  projects: [
    {
      index: "01",
      title: "Documentary of Vietnam",
      desc: "A travel documentary cut — Vietnam shot and edited as a cinematic motion piece.",
      tags: ["Documentary", "Edit"],
      tools: ["Premiere Pro", "After Effects"],
      year: "2026",
      cover: "",
      url: "",
    },
    {
      index: "02",
      title: "Motion Portfolio 2026",
      desc: "A year's worth of motion — brand pieces, micro-interactions and experiments.",
      tags: ["Motion Design", "Advertising"],
      tools: ["After Effects", "Photoshop", "Illustrator"],
      year: "2026",
      cover:
        "https://mir-s3-cdn-cf.behance.net/project_modules/max_632_webp/08dfbe231756993.68a1bb3d00cbf.png",
      url: "https://www.behance.net/gallery/231756993/Portfolio-2026",
    },
    {
      index: "03",
      title: "AI Shortfilm with Free Tools",
      desc: "A short film built entirely with free AI tools — zero budget, full imagination.",
      tags: ["AI Film", "Direction"],
      tools: ["AI Tools", "After Effects", "Premiere Pro"],
      year: "2026",
      cover: "",
      url: "",
    },
    {
      index: "04",
      title: "Visual Product Design",
      desc: "Product thinking meets motion — interfaces designed to move.",
      tags: ["Product", "UI Motion"],
      tools: ["Figma", "After Effects"],
      year: "2026",
      cover: "",
      url: "",
    },
  ],
};

export const about = {
  kicker: "About",
  bio: "I'm a motion designer who believes restraint is a craft. For the past years I've designed movement for screens at Inshorts — work that millions of people feel every day, often without noticing. I care about timing, typography, and the quiet confidence of things done well.",
  details: [
    {
      label: "Currently",
      lines: ["Motion Designer", "Inshorts — Noida"],
    },
    {
      label: "Tools",
      lines: ["After Effects", "Photoshop", "Illustrator", "Figma", "Premiere Pro"],
    },
    {
      label: "Base",
      lines: ["Noida, India", "Working worldwide"],
    },
  ],
};

export const contact = {
  kicker: "Contact",
  titleLines: [{ text: "Have an idea" }, { text: "in motion?", italic: true }],
  cta: "Get in touch — Behance",
  backToTop: "Back to top ↑",
};
