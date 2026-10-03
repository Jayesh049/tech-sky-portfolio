import { useEffect, useState } from 'react';

// The window every build scene sits in. The DEMO tag is not decoration: the
// scenes are demonstrations of what the technology is for, not claims about
// a particular project, and the tag says so on screen.
export default function SceneFrame({ title, status, alive, className = '', children }) {
  return (
    <div className={`art ${className}`} data-alive={alive ? 'true' : 'false'}>
      <div className="art-bar">
        <span className="art-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="art-title">{title}</span>
        <span className="art-tag">Demo</span>
      </div>
      <div className="art-body">{children}</div>
      <p className="art-foot">
        <span className="art-live" aria-hidden="true" />
        {status}
      </p>
    </div>
  );
}

// A counter that advances every `ms` while `active`. The scenes derive their
// "live" numbers from it, so each one re-renders a few times a second at most.
export function useTick(active, ms) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return undefined;
    const id = setInterval(() => setN((v) => v + 1), ms);
    return () => clearInterval(id);
  }, [active, ms]);
  return n;
}

// data-on for the part of a scene built by step k.
export const on = (step, k) => (step > k ? 'true' : 'false');
