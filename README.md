# Portfolio Tower — 3D monolith concept

A quiet, premium, single-viewport 3D experience for Harsh Kumar Singh's portfolio — a dark hexagonal tower the visitor spins with scroll or drag, with four clickable project levels.

**Stack:** Vite + React + Tailwind CSS v4 + three.js (`@react-three/fiber` / `@react-three/drei`) + GSAP.

## Interaction

- **Scroll / drag** — rotates the tower (damped). After 6s idle it drifts very slowly on its own.
- **Click a level** — the tower turns that project to face you, the camera dollies in, and a detail panel slides in (right side on desktop, bottom sheet on mobile). Escape or Close dismisses it.
- Every word lives in **`src/content.js`** — edit text between the quotes, commit, rebuild.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # outputs to dist/
```
