import { useEffect, useRef } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export function useLandingScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const currentSectionRef = useRef(0);
  const isSnappingRef = useRef(false);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.8,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    // RAF loop for Lenis
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Track current section via IntersectionObserver
    const sectionEls = document.querySelectorAll<HTMLElement>("[data-section]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Array.from(sectionEls).indexOf(
              entry.target as HTMLElement,
            );
            if (idx >= 0) currentSectionRef.current = idx;
          }
        });
      },
      { threshold: 0.6 },
    );
    sectionEls.forEach((el) => observer.observe(el));

    // Detect mouse wheel vs touchpad and handle snap
    const handleWheel = (e: WheelEvent) => {
      // Mouse wheel: deltaMode 1 (line-based, Firefox) or large discrete pixel delta
      const isMouseWheel =
        e.deltaMode === 1 || (e.deltaMode === 0 && Math.abs(e.deltaY) >= 80);

      if (isMouseWheel) {
        e.preventDefault();
        e.stopImmediatePropagation(); // prevent Lenis from processing

        if (isSnappingRef.current) return;

        const dir = e.deltaY > 0 ? 1 : -1;
        const next = Math.max(
          0,
          Math.min(sectionEls.length - 1, currentSectionRef.current + dir),
        );

        if (next !== currentSectionRef.current) {
          isSnappingRef.current = true;
          currentSectionRef.current = next;

          lenis.scrollTo(sectionEls[next], {
            duration: 0.7,
            onComplete: () => {
              setTimeout(() => {
                isSnappingRef.current = false;
              }, 200);
            },
          });
        }
      }
      // Touchpad: event propagates normally, Lenis smooths it
    };

    window.addEventListener("wheel", handleWheel, {
      passive: false,
      capture: true,
    });

    // Handle hash scroll on mount (when navigating from another page)
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const target = document.getElementById(hash);
      if (target) {
        setTimeout(() => {
          lenis.scrollTo(target, { duration: 0.7 });
        }, 100);
      }
    }

    return () => {
      window.removeEventListener("wheel", handleWheel, true);
      observer.disconnect();
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}
