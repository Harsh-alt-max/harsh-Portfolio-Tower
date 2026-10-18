import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";
import { loader } from "../content";

/** Quiet paper loader: the name fades in, holds a beat, fades out. ~1.2s. */
export default function Loader({ onDone }) {
  const rootRef = useRef(null);
  const nameRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: onDone });
      tl.fromTo(
        nameRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" }
      )
        .to(nameRef.current, { opacity: 0, y: -10, duration: 0.4, ease: "power2.in" }, "+=0.35")
        .to(rootRef.current, { opacity: 0, duration: 0.45, ease: "power1.out" }, "-=0.1");
    }, rootRef);
    return () => ctx.revert();
  }, [onDone]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-paper"
    >
      <p
        ref={nameRef}
        className="font-serif text-2xl font-light tracking-wide opacity-0 md:text-3xl"
      >
        {loader.name}
      </p>
    </div>
  );
}
