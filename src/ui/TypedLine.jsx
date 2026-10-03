import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useEnvironment.js';

/**
 * The site's signature: every section is introduced by the line of source that
 * could have produced it, typed out the way the hero types its geometry.
 */
export default function TypedLine({ text, speed = 26, as: Tag = 'p', className = '' }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const [shown, setShown] = useState(0);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (reduced) {
      setShown(text.length);
      return;
    }
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) {
      setArmed(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setArmed(true);
          io.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, text.length]);

  useEffect(() => {
    if (!armed || reduced) return;
    let raf = 0;
    let start = 0;
    const total = text.length * speed;
    const step = (now) => {
      if (!start) start = now;
      const k = Math.min(1, (now - start) / total);
      setShown(Math.round(k * text.length));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [armed, reduced, speed, text]);

  const done = shown >= text.length;

  return (
    <Tag ref={ref} className={`srcline ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, shown)}
        <span className="srcline-caret" data-done={done ? 'true' : 'false'} />
      </span>
    </Tag>
  );
}
