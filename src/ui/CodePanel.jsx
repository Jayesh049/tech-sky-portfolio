import { useEffect, useMemo, useRef, useState } from 'react';
import tokenData from '../data/tokens.generated.json';

const { palette, snippets } = tokenData;

function lengthOf(lines) {
  let n = 0;
  for (const line of lines) {
    for (const [text] of line) n += text.length;
    n += 1; // the newline
  }
  return n;
}

/**
 * Types a shiki-highlighted snippet. The highlighting happened at build time
 * (scripts/tokenize.mjs), so nothing heavier than an array walk runs here.
 */
export default function CodePanel({
  snippetKey,
  label,
  duration = 1400,
  typing = true,
  onDone,
  numbered = false,
  className = '',
  highlight = null, // a Set of 0-based line numbers to light up
}) {
  const lines = snippets[snippetKey] || [];
  const total = useMemo(() => lengthOf(lines), [lines]);
  const [shown, setShown] = useState(typing ? 0 : total);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!typing) {
      setShown(total);
      return;
    }
    setShown(0);

    let raf = 0;
    let start = 0;
    const step = (now) => {
      if (!start) start = now;
      const k = Math.min(1, (now - start) / duration);
      // ease-out so the last characters land rather than stop
      const eased = 1 - Math.pow(1 - k, 2);
      setShown(Math.round(eased * total));
      if (k < 1) raf = requestAnimationFrame(step);
      else doneRef.current?.();
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [snippetKey, duration, typing, total]);

  let budget = shown;
  const out = [];

  for (let li = 0; li < lines.length; li += 1) {
    if (budget <= 0 && li > 0) break;
    const parts = [];

    for (let ti = 0; ti < lines[li].length; ti += 1) {
      const [text, colorIndex] = lines[li][ti];
      if (budget <= 0) break;
      const slice = text.length <= budget ? text : text.slice(0, budget);
      budget -= slice.length;
      parts.push(
        <span key={ti} style={{ color: palette[colorIndex] }}>
          {slice}
        </span>
      );
    }

    out.push(
      <div className="cp-line" key={li} data-hl={highlight?.has(li) ? 'true' : undefined}>
        {parts.length ? parts : <span>&nbsp;</span>}
      </div>
    );
    budget -= 1; // newline
  }

  const complete = shown >= total;

  return (
    <div
      className={`cp${numbered ? ' cp--numbered' : ''}${className ? ` ${className}` : ''}`}
      data-complete={complete ? 'true' : 'false'}
    >
      <div className="cp-bar" aria-hidden="true">
        <span className="cp-dot" />
        <span className="cp-dot" />
        <span className="cp-dot" />
        <span className="cp-name">{label}</span>
      </div>
      <pre className="cp-body">
        <code>
          {out}
          {!complete && <span className="cp-caret" aria-hidden="true" />}
        </code>
      </pre>
    </div>
  );
}
