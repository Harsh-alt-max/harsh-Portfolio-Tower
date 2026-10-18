// Shared Lenis instance holder so nav links can smooth-scroll anywhere.
let lenis = null;

export function setLenis(instance) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}

export function scrollToSection(target) {
  if (lenis) {
    lenis.scrollTo(target, { offset: 0, duration: 1.4 });
  } else if (typeof target === "string") {
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  }
}
