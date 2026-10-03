import { useEffect, useRef } from 'react';

// COMPILING: the build steps of the picked technology, ticking in order over
// a progress bar. Progress runs on its own requestAnimationFrame clock for
// the same `duration` the timeline gives the phase, and writes the bar, the
// percentage and each step's state straight to the DOM, so the panel renders
// once and never again while it counts.
export default function CompilePanel({ title, steps, duration = 2800, done = false, accent = '#9fe8ff' }) {
  const rootRef = useRef(null);
  const pctRef = useRef(null);
  const stepRefs = useRef([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const n = steps.length;
    const paint = (k) => {
      root.style.setProperty('--p', k.toFixed(4));
      if (pctRef.current) pctRef.current.textContent = `${Math.round(k * 100)}%`;
      // A step is running from its start until the next one starts, then done.
      stepRefs.current.forEach((el, i) => {
        if (!el) return;
        const at = i / n;
        const state = k >= (i + 1) / n - 0.001 ? 'done' : k >= at ? 'run' : 'wait';
        if (el.dataset.state !== state) el.dataset.state = state;
      });
    };
    if (done) {
      paint(1);
      return undefined;
    }
    let raf = 0;
    let start = 0;
    const tick = (now) => {
      if (!start) start = now;
      // Slightly eased, and held just short of the end: the last step lands
      // when the timeline says COMPILE_COMPLETE, not a frame before.
      const k = Math.min(1, (now - start) / duration);
      paint(Math.min(0.97, 1 - (1 - k) ** 1.3));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [done, duration, steps]);

  return (
    <div className="cmp" ref={rootRef} data-done={done ? 'true' : 'false'} style={{ '--accent': accent }}>
      <div className="cmp-head">
        <span className="cmp-spin" aria-hidden="true" />
        <p className="cmp-title">{done ? 'Build complete' : `${title}…`}</p>
      </div>
      <ol className="cmp-steps">
        {steps.map((s, i) => (
          <li
            key={s}
            className="cmp-step"
            data-state="wait"
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
          >
            <span className="cmp-tick" aria-hidden="true">
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1" />
                <path d="M4.8 8.3l2.1 2.1 4.4-4.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {s}
          </li>
        ))}
      </ol>
      <div className="cmp-bar" aria-hidden="true">
        <span className="cmp-fill" />
      </div>
      <p className="cmp-pct" ref={pctRef} aria-hidden="true">
        0%
      </p>
    </div>
  );
}
