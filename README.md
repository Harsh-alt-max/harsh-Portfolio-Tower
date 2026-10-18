# Harsh Kumar Singh — Portfolio (Elegant Concept)

A minimal, quiet, elegant, premium portfolio concept — light editorial theme, whisper-soft motion. Fully separate from the "Dark and neon" concept.

**Stack:** Vite + React + Tailwind CSS v4 + GSAP (ScrollTrigger) + Lenis smooth scrolling.

## Design

- Palette: paper `#f3efe7`, ink `#191713`, muted `#6f6a5e`, hairline `#ddd5c4`, bronze `#9a7b4f` (sparingly)
- Type: Fraunces (serif headlines) + Inter (body/labels), loaded via Google Fonts in CSS
- Sections: quiet loader → fixed nav → editorial hero → work index (4 projects, cursor-follow preview) → about → contact footer with live Noida clock

## Editing the words

Every word on the site lives in **`src/content.js`** — change text between the quotes, commit, and the site rebuilds itself in 2–3 minutes.

## Development

```bash
npm install
npm run dev
```

## Build & deploy

```bash
npm run build   # outputs to dist/
```

`vite.config.js` uses `base: './'` so the build works on a GitHub Pages subpath. To publish: push to a repo, add a Pages deploy workflow, set Pages source to GitHub Actions.

Project artwork loads from the artist's own Behance CDN ([behance.net/harsh19_](https://www.behance.net/harsh19_)).
