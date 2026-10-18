import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";

/** Quiet scroll reveal: fade + 24px rise, expo.out. Fires once per element. */
export default function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tween = gsap.fromTo(
      el,
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "expo.out",
        delay,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
