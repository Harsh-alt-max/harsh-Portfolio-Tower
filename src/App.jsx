import { useCallback, useEffect, useState } from "react";
import TowerScene from "./components/TowerScene";
import ProjectPanel from "./components/ProjectPanel";
import Loader from "./components/Loader";
import Chrome from "./components/Chrome";
import { projects } from "./content";

export default function App() {
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState(null);
  const [interacted, setInteracted] = useState(false);

  const markInteracted = useCallback(() => setInteracted(true), []);

  // Escape closes the panel
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="fixed inset-0 select-none overflow-hidden bg-[#0e0e10] text-[#ece7db]">
      <TowerScene
        selected={selected}
        onSelect={setSelected}
        onFirstInteract={markInteracted}
      />
      {/* CSS vignette over the 3D scene */}
      <div className="vignette pointer-events-none absolute inset-0 z-10" />
      <Chrome dimmed={interacted} />
      <ProjectPanel
        project={selected != null ? projects[selected] : null}
        onClose={() => setSelected(null)}
      />
      {!ready && <Loader onDone={() => setReady(true)} />}
    </div>
  );
}
