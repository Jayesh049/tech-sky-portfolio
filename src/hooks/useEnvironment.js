import { useEffect, useState } from 'react';

function useMedia(query, initial = false) {
  const [match, setMatch] = useState(() =>
    typeof window === 'undefined' ? initial : window.matchMedia(query).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = (e) => setMatch(e.matches);
    setMatch(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);

  return match;
}

// Listened to live, in both directions, not just read once on load.
export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)');
export const useIsSmall = () => useMedia('(max-width: 767px)');
export const useCoarsePointer = () => useMedia('(pointer: coarse)');

export function hasWebGL() {
  if (typeof window === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext('webgl2') || c.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

// Sandpack runs the typed React in a remote bundler. If that is unreachable we
// say so and show the code instead of leaving a spinner turning forever.
export function useRuntimeReachable() {
  const [state, setState] = useState('checking');

  useEffect(() => {
    let live = true;
    const timer = setTimeout(() => live && setState('down'), 6000);

    fetch('https://sandpack-bundler.codesandbox.io/', { mode: 'no-cors', cache: 'no-store' })
      .then(() => {
        if (!live) return;
        clearTimeout(timer);
        setState('up');
      })
      .catch(() => {
        if (!live) return;
        clearTimeout(timer);
        setState('down');
      });

    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, []);

  return state;
}

// Entrances: adds .in once, then stops observing.
export function useReveal(options = {}) {
  const { threshold = 0.18, rootMargin = '0px 0px -8% 0px' } = options;

  useEffect(() => {
    const nodes = document.querySelectorAll('[data-reveal]:not(.in)');
    // No early return on an empty list: nodes mount later, and bailing here
    // would skip installing the MutationObserver that catches them.

    if (!('IntersectionObserver' in window)) {
      nodes.forEach((n) => n.classList.add('in'));
      return;
    }

    const timers = [];

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('in');
          io.unobserve(e.target);
          // Retire the stagger once it has played. Left in place, every later
          // hover on a staggered child lags by its entrance delay forever.
          timers.push(setTimeout(() => e.target.classList.add('done'), 1100));
        });
      },
      { threshold, rootMargin }
    );

    // Observe once per node, ever. The WeakSet is what makes the
    // MutationObserver below cheap: it can re-scan the whole document on any
    // mutation and still only ever hand new nodes to the IO.
    const seen = new WeakSet();
    const observe = (n) => {
      if (seen.has(n)) return;
      seen.add(n);
      io.observe(n);
    };

    nodes.forEach(observe);

    // The original query ran once, so anything mounted LATER was never
    // observed and sat at zero opacity for good: the persistent code rail
    // (mounts on the second chip click), the chips themselves, and every
    // stagger container added by this theme. The scroll sweep below only
    // rescues nodes already above the fold, so a node mounting below it after
    // the last scroll event stayed invisible. Re-scan on mutation instead.
    let scanRaf = 0;
    const scan = () => {
      scanRaf = 0;
      document.querySelectorAll('[data-reveal]:not(.in)').forEach(observe);
    };
    const mo =
      'MutationObserver' in window
        ? new MutationObserver(() => {
            if (!scanRaf) scanRaf = requestAnimationFrame(scan);
          })
        : null;
    mo?.observe(document.body, { childList: true, subtree: true });

    // Safety net. A jump straight to an anchor, or a hard fling, can carry the
    // viewport past an element without it ever intersecting, and it would then
    // sit at zero opacity for good. Anything the visitor has already scrolled
    // past gets shown regardless.
    let raf = 0;
    const sweep = () => {
      raf = 0;
      document.querySelectorAll('[data-reveal]:not(.in)').forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add('in');
          io.unobserve(el);
          timers.push(setTimeout(() => el.classList.add('done'), 1100));
        }
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sweep);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      io.disconnect();
      mo?.disconnect();
      timers.forEach(clearTimeout);
      if (raf) cancelAnimationFrame(raf);
      if (scanRaf) cancelAnimationFrame(scanRaf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [threshold, rootMargin]);
}
