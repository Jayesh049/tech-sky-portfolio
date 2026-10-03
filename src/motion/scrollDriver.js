import { useEffect } from 'react';
import { view } from '../scene/state.js';

// The single owner of continuous, scroll-linked motion.
//
// Deliberately not GSAP ScrollTrigger. It does ship with gsap 3.15, but
// everything on this page is either a discrete entrance — which the
// IntersectionObserver in useReveal already handles, and which the test suite
// already measures via [data-reveal].in — or one continuous value, which is
// this file. Adding ScrollTrigger would buy ~40 KB, a second scroll authority
// fighting `html { scroll-behavior: smooth }`, and a refresh() obligation on
// every dynamic mount. If a pinned or scrubbed sequence is ever wanted, that
// is the moment to add it.
//
// Writes only custom properties and one mutable field. No layout property is
// ever read or written in the handler, so this cannot cause a reflow.

const SELECTOR = '[data-parallax]';

export function useScrollMotion() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const reduced =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    const hero = document.querySelector('.hero');
    const nodes = Array.from(document.querySelectorAll(SELECTOR));

    if (reduced) {
      // Park everything at its neutral value rather than leaving stale ones.
      view.parallax = 0;
      nodes.forEach((n) => n.style.setProperty('--p', '0'));
      return undefined;
    }

    let raf = 0;

    const read = () => {
      raf = 0;
      const vh = window.innerHeight || 1;

      // -1 when the hero's centre is a viewport below the middle of the
      // screen, +1 when it is a viewport above. Rig lerps this, so a fling
      // produces a glide rather than a snap.
      if (hero) {
        const r = hero.getBoundingClientRect();
        const centre = r.top + r.height / 2;
        const p = (vh / 2 - centre) / vh;
        view.parallax = Math.max(-1, Math.min(1, p));
      }

      for (const n of nodes) {
        const r = n.getBoundingClientRect();
        const p = (vh / 2 - (r.top + r.height / 2)) / vh;
        n.style.setProperty('--p', Math.max(-1, Math.min(1, p)).toFixed(4));
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };

    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      view.parallax = 0;
    };
  }, []);
}
