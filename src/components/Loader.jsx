import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { site } from "../content";

/** Quiet ivory loader: letterspaced serif name, thin champagne bar, fades out. */
export default function Loader({ onDone }) {
  const root = useRef();
  const bar = useRef();
  const word = useRef();

  useEffect(() => {
    const tl = gsap.timeline({ onComplete: onDone });
    tl.fromTo(
      word.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" }
    )
      .fromTo(
        bar.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.2, ease: "power2.inOut" },
        "-=0.5"
      )
      .to(
        word.current,
        { opacity: 0, duration: 0.5, ease: "power2.in" },
        "+=0.15"
      )
      .to(root.current, {
        opacity: 0,
        duration: 0.7,
        ease: "power2.inOut",
      });
    return () => tl.kill();
  }, [onDone]);

  return (
    <div
      ref={root}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f2ede2]"
    >
      <p
        ref={word}
        className="font-serif text-xl tracking-[0.4em] text-[#211d16] md:text-2xl"
      >
        {site.loader}
      </p>
      <div className="mt-8 h-px w-48 bg-[#211d16]/10">
        <div ref={bar} className="h-full w-full origin-left bg-[#c9a06a]" />
      </div>
    </div>
  );
}
