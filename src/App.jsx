import { useCallback, useEffect, useRef, useState } from "react";
import TowerScene from "./components/TowerScene";
import ProjectPanel from "./components/ProjectPanel";
import Loader from "./components/Loader";
import Chrome from "./components/Chrome";
import ContactCard from "./components/ContactCard";
import { projects, ui } from "./content";

export default function App() {
  const [ready, setReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [selected, setSelected] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);
  const [night, setNight] = useState(false);
  const [hoverIdx, setHoverIdx] = useState(null);
  const tipRef = useRef(null);

  // gate canvas-texture creation behind real font loads (Georgia fallback if it fails)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await Promise.race([
          Promise.all([
            document.fonts.load("300 64px Fraunces"),
            document.fonts.load("500 24px Inter"),
          ]),
          new Promise((r) => setTimeout(r, 2600)),
        ]);
      } catch {
        /* fallback fonts in the canvas stacks */
      }
      if (alive) setFontsReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // threshold-crossing scroll state only (no per-frame re-renders)
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      const s = window.scrollY > 40;
      setScrolled((prev) => (prev !== s ? s : prev));
      const c = p > 0.88;
      setContactVisible((prev) => (prev !== c ? c : prev));
    };
    const onKey = (e) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // keep the page backdrop (overscroll) in step with the scene
  useEffect(() => {
    document.documentElement.style.background = night ? "#0b1026" : "#f2ede2";
  }, [night]);

  const handleSelect = useCallback((i) => {
    setSelected(i);
    setHoverIdx(null);
  }, []);

  const handleHoverChange = useCallback((i) => {
    setHoverIdx((prev) => (prev === i ? prev : i));
  }, []);

  // tooltip follows the cursor by direct DOM writes — no re-renders
  const handleHoverMove = useCallback((x, y) => {
    const el = tipRef.current;
    if (el) el.style.transform = `translate(${x + 16}px, ${y + 18}px)`;
  }, []);

  const hovered = hoverIdx != null ? projects[hoverIdx] : null;

  return (
    <div
      className={`transition-colors duration-1000 ${
        night ? "bg-[#0b1026] text-[#f2ede2]" : "bg-[#f2ede2] text-[#211d16]"
      }`}
    >
      {/* fixed 3D canvas behind everything */}
      <div className="fixed inset-0">
        <TowerScene
          fontsReady={fontsReady}
          night={night}
          onSelect={handleSelect}
          onHoverChange={handleHoverChange}
          onHoverMove={handleHoverMove}
        />
      </div>

      <Chrome
        dimmed={scrolled}
        night={night}
        onToggleNight={() => setNight((n) => !n)}
      />
      <ProjectPanel
        project={selected != null ? projects[selected] : null}
        onClose={() => setSelected(null)}
      />
      <ContactCard visible={contactVisible && selected == null} />

      {/* billboard hover tooltip — follows the cursor, rendered only when hovering */}
      <div
        ref={tipRef}
        className="pointer-events-none fixed left-0 top-0 z-40 will-change-transform"
      >
        <div
          className={`transition-opacity duration-200 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          {hovered && (
            <div className="rounded-xl bg-[#171410]/90 px-4 py-2.5 shadow-xl backdrop-blur-sm">
              <p className="font-serif text-[15px] font-light leading-tight text-[#f6f2e8]">
                {hovered.title}
              </p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.24em] text-[#c9a06a]">
                {ui.tooltip}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* the scroll journey: 300vh of travel */}
      <div className="h-[300vh]" aria-hidden />

      {!ready && <Loader onDone={() => setReady(true)} />}
    </div>
  );
}
