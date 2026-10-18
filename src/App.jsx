import { useEffect, useState } from "react";
import TowerScene from "./components/TowerScene";
import ProjectPanel from "./components/ProjectPanel";
import Loader from "./components/Loader";
import Chrome from "./components/Chrome";
import ContactCard from "./components/ContactCard";
import { projects } from "./content";

export default function App() {
  const [ready, setReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [selected, setSelected] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);

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

  return (
    <div className="bg-[#f2ede2] text-[#211d16]">
      {/* fixed 3D canvas behind everything */}
      <div className="fixed inset-0">
        <TowerScene fontsReady={fontsReady} onSelect={setSelected} />
      </div>

      <Chrome dimmed={scrolled} />
      <ProjectPanel
        project={selected != null ? projects[selected] : null}
        onClose={() => setSelected(null)}
      />
      <ContactCard visible={contactVisible && selected == null} />

      {/* the scroll journey: 300vh of travel */}
      <div className="h-[300vh]" aria-hidden />

      {!ready && <Loader onDone={() => setReady(true)} />}
    </div>
  );
}
