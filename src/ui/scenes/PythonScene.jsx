import SceneFrame, { useTick, on } from './SceneFrame.jsx';

// A fixed telemetry trace: query durations, three of them far out.
const BASE = [42, 38, 45, 40, 44, 39, 41, 188, 43, 37, 46, 40, 42, 39, 171, 44, 41, 38, 45, 42, 40, 205, 43, 39];
const OUT = new Set([7, 14, 21]);

// Python: a Flask endpoint takes query telemetry into a DataFrame, picks the
// features, fits an IsolationForest and flags the anomalies.
export default function PythonScene({ step, alive, status }) {
  const n = useTick(alive, 600);
  const W = 300;
  const H = 90;
  const shift = alive ? n % BASE.length : 0;
  const vals = BASE.map((_, i) => BASE[(i + shift) % BASE.length]);
  const flags = vals.map((_, i) => OUT.has((i + shift) % BASE.length));
  const x = (i) => (i / (vals.length - 1)) * W;
  const y = (v) => H - 6 - (v / 220) * (H - 12);
  const path = vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  return (
    <SceneFrame title="Query telemetry" status={status} alive={alive} className="art-py">
      <div className="py-top">
        <code className="py-route" data-on={on(step, 0)}>
          POST /anomalies
        </code>
        <code className="py-model" data-on={on(step, 3)}>
          IsolationForest(contamination=0.02)
        </code>
      </div>
      <svg className="py-chart" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" data-on={on(step, 1)}>
        <path className="py-line" d={path} />
        <g data-on={on(step, 4)}>
          {vals.map((v, i) => (flags[i] ? <circle key={i} className="py-out" cx={x(i)} cy={y(v)} r="5" /> : null))}
        </g>
      </svg>
      <table className="sql-result py-df" data-on={on(step, 1)}>
        <thead>
          <tr>
            <th data-hot={step > 2 ? 'true' : 'false'}>duration_ms</th>
            <th data-hot={step > 2 ? 'true' : 'false'}>rows</th>
            <th data-hot={step > 2 ? 'true' : 'false'}>locks</th>
            <th>anomaly</th>
          </tr>
        </thead>
        <tbody>
          {[
            [vals[5], 1200, 0, flags[5]],
            [vals[7], 98000, 14, flags[7]],
            [vals[9], 850, 1, flags[9]],
          ].map((r, i) => (
            <tr key={i}>
              <td>{r[0]}</td>
              <td>{r[1]}</td>
              <td>{r[2]}</td>
              <td className={step > 4 && r[3] ? 'py-true' : ''}>{step > 4 ? (r[3] ? 'True' : 'False') : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="nd-ready" data-on={on(step, 5)}>
        {'200 { "anomalies": 3 }'}
      </p>
    </SceneFrame>
  );
}
