import { useEffect, useState } from 'react';
import SceneFrame, { useTick, on } from './SceneFrame.jsx';

const BASE = [18, 24, 22, 30, 28, 36, 34, 42, 40, 48];
const FEED = ['New user registered', 'Data updated', 'API response received', 'Build successful', 'Session started'];

function linePath(vals, w = 200, h = 56) {
  const max = 60;
  const step = w / (vals.length - 1);
  return vals.map((v, i) => `${i ? 'L' : 'M'}${(i * step).toFixed(1)} ${(h - (v / max) * h).toFixed(1)}`).join(' ');
}

// React: code becomes components, components become a working dashboard.
export default function ReactScene({ step, alive, status }) {
  const n = useTick(alive, 900);
  const [count, setCount] = useState(0);
  const [pressed, setPressed] = useState(false);

  // Once alive, the button clicks itself every other tick; the visitor can
  // click it too.
  useEffect(() => {
    if (!alive || n === 0 || n % 2) return undefined;
    setCount((c) => c + 1);
    setPressed(true);
    const id = setTimeout(() => setPressed(false), 220);
    return () => clearTimeout(id);
  }, [alive, n]);

  const users = 1248 + n * 3;
  const active = [87, 88, 86, 89][n % 4];
  const vals = BASE.map((v, i) => v + Math.sin((i + n) * 0.9) * 3 + (alive ? n * 0.15 : 0));
  const line = linePath(vals);

  return (
    <SceneFrame title="Dashboard" status={status} alive={alive} className="art-react">
      <div className="rx">
        <div className="rx-top" data-on={on(step, 0)}>
          <span className="rx-h">Dashboard</span>
          <span className="rx-dot" />
        </div>
        <div className="rx-stats" data-on={on(step, 1)}>
          <div className="rx-stat">
            <span className="rx-k">Total users</span>
            <span className="rx-v">{users.toLocaleString('en-US')}</span>
            <span className="rx-d">+12%</span>
          </div>
          <div className="rx-stat">
            <span className="rx-k">Active</span>
            <span className="rx-v">{active}%</span>
            <span className="rx-d">+5%</span>
          </div>
        </div>
        <div className="rx-chart" data-on={on(step, 2)}>
          <span className="rx-k">User growth</span>
          <div className="rx-plot">
            <svg viewBox="0 0 200 56" preserveAspectRatio="none" aria-hidden="true">
              <path className="rx-area" d={`${line} L200 56 L0 56 Z`} />
              <path className="rx-line" d={line} />
            </svg>
          </div>
        </div>
        <ul className="rx-feed" data-on={on(step, 3)}>
          {[0, 1, 2].map((i) => (
            <li key={`${n}-${i}`} data-new={alive && i === 0 ? 'true' : 'false'}>
              <span className="rx-tick" />
              {FEED[(n + i) % FEED.length]}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="rx-btn"
          data-on={on(step, 4)}
          data-pressed={pressed ? 'true' : 'false'}
          onClick={() => setCount((c) => c + 1)}
          tabIndex={step > 4 ? 0 : -1}
        >
          Increment <span className="rx-count">{count}</span>
        </button>
      </div>
    </SceneFrame>
  );
}
