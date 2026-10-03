import SceneFrame, { useTick, on } from './SceneFrame.jsx';

const REQS = [
  ['GET', '/users', 200, 24],
  ['POST', '/login', 201, 45],
  ['GET', '/dashboard', 200, 31],
  ['POST', '/invoice', 401, 12],
  ['GET', '/users/42', 200, 18],
  ['POST', '/login', 201, 39],
];
const TEXT = { 200: 'OK', 201: 'Created', 401: 'Unauthorized' };

// Node.js: a server comes up, and requests start moving through it.
export default function NodeScene({ step, alive, status }) {
  const n = useTick(alive, 750);
  const rows = [0, 1, 2, 3, 4, 5].map((i) => REQS[(n + i) % REQS.length]);
  return (
    <SceneFrame title="node server.js" status={status} alive={alive} className="art-node">
      <div className="nd-pipe" data-run={alive ? 'true' : 'false'}>
        {['Client', 'Node.js', 'Database', 'Response'].map((k, i) => (
          <div key={k} className="nd-box" data-on={on(step, [0, 2, 3, 4][i])}>
            {k}
          </div>
        ))}
        <span className="nd-req" data-on={on(step, 1)}>
          request
        </span>
      </div>
      <ul className="nd-log" data-on={on(step, 4)}>
        {rows.map(([m, path, code, ms], i) => (
          <li key={`${n}-${i}`} data-new={alive && i === 5 ? 'true' : 'false'}>
            <span className="nd-m">{m}</span>
            <span className="nd-p">{path}</span>
            <span className="nd-s" data-code={code}>
              {code} {TEXT[code]}
            </span>
            <span className="nd-ms">{ms}ms</span>
          </li>
        ))}
      </ul>
      <p className="nd-ready" data-on={on(step, 5)}>
        Server running on port 3000
      </p>
    </SceneFrame>
  );
}
