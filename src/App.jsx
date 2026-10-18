import { useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./lib/gsap";
import { setLenis, getLenis } from "./lib/scroll";

import Loader from "./components/Loader";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Work from "./components/Work";
import About from "./components/About";
import Contact from "./components/Contact";

/**
 * Portfolio — elegant concept.
 * Quiet editorial layout: loader → hero → work → about → contact.
 * All words live in src/content.js.
 */
export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    setLenis(lenis);

    // drive Lenis through GSAP's ticker so ScrollTrigger stays in sync
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    lenis.on("scroll", ScrollTrigger.update);

    // lock scroll while the loader is up
    lenis.stop();

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  const handleLoaded = () => {
    setReady(true);
    setTimeout(() => {
      getLenis()?.start();
      ScrollTrigger.refresh();
    }, 100);
  };

  return (
    <div className="min-h-svh bg-paper text-ink">
      {!ready && <Loader onDone={handleLoaded} />}
      <Navbar />
      <main>
        <Hero ready={ready} />
        <Work />
        <About />
        <Contact />
      </main>
    </div>
  );
}
