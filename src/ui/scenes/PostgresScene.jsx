import { useMemo } from 'react';
import SceneFrame, { useTick, on } from './SceneFrame.jsx';

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let x = s;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
const BOOKS = ['Physiology', 'Pharmacology', 'Endocrinology', 'Pathology', 'Anatomy'];

// PostgreSQL + pgvector: chunks become points, an HNSW graph links them, and
// the query pulls back its five nearest neighbours.
export default function PostgresScene({ step, alive, status }) {
  const pts = useMemo(() => {
    const r = rng(11);
    return Array.from({ length: 42 }, (_, i) => ({ x: 12 + r() * 276, y: 10 + r() * 110, b: BOOKS[i % 5] }));
  }, []);
  const edges = useMemo(() => {
    const out = [];
    pts.forEach((p, i) => {
      const near = pts
        .map((q, j) => [j, (q.x - p.x) ** 2 + (q.y - p.y) ** 2])
        .filter(([j]) => j !== i)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 2);
      near.forEach(([j]) => i < j && out.push([p, pts[j]]));
    });
    return out;
  }, [pts]);
  const n = useTick(alive, 1500);
  const q = { x: 150 + Math.sin(n * 1.3) * 70, y: 64 + Math.cos(n * 0.9) * 30 };
  const nearest = pts
    .map((p, i) => [i, Math.hypot(p.x - q.x, p.y - q.y)])
    .sort((a, b) => a[1] - b[1])
    .slice(0, 5);
  const hit = new Set(nearest.map(([i]) => i));
  return (
    <SceneFrame title="Vector search" status={status} alive={alive} className="art-pg">
      <svg className="pg-map" viewBox="0 0 300 130" aria-hidden="true" data-on={on(step, 1)}>
        <g className="pg-edges" data-on={on(step, 3)}>
          {edges.map(([a, b], i) => (
            <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
          ))}
        </g>
        <g data-on={on(step, 2)}>
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={hit.has(i) && step > 4 ? 3.4 : 2.2} className={hit.has(i) && step > 4 ? 'pg-hit' : 'pg-pt'} />
          ))}
        </g>
        <g data-on={on(step, 4)}>
          {nearest.map(([i]) => (
            <line key={`q${i}`} className="pg-q" x1={q.x} y1={q.y} x2={pts[i].x} y2={pts[i].y} />
          ))}
          <circle className="pg-query" cx={q.x} cy={q.y} r="4.5" />
        </g>
      </svg>
      <table className="sql-result pg-rows" data-on={on(step, 4)}>
        <thead>
          <tr>
            <th>Book</th>
            <th>Distance</th>
          </tr>
        </thead>
        <tbody>
          {nearest.slice(0, 4).map(([i, d]) => (
            <tr key={i}>
              <td>{pts[i].b}</td>
              <td>{(d / 400).toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SceneFrame>
  );
}
