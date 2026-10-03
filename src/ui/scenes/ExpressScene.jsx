import SceneFrame, { on } from './SceneFrame.jsx';

const CHAIN = ['Request', 'Middleware', 'Auth', 'Route', 'Controller', 'Response'];
const CHECKS = [
  ['Auth', 2],
  ['Validation', 3],
  ['Controller', 4],
  ['Response', 5],
];

// Express: a request walks the middleware chain and comes back 200 OK.
export default function ExpressScene({ step, alive, status }) {
  return (
    <SceneFrame title="GET /api/users" status={status} alive={alive} className="art-ex">
      <div className="ex-grid">
        <ol className="ex-chain" data-run={alive ? 'true' : 'false'}>
          {CHAIN.map((k, i) => (
            <li key={k} className="ex-node" data-on={on(step, i)} style={{ '--i': i }}>
              {k}
            </li>
          ))}
        </ol>
        <div className="ex-side">
          <ul className="ex-checks">
            {CHECKS.map(([k, s]) => (
              <li key={k} data-on={on(step, s)}>
                <span aria-hidden="true">✓</span> {k}
              </li>
            ))}
          </ul>
          <p className="ex-ok" data-on={on(step, 5)}>
            200 OK
          </p>
        </div>
      </div>
    </SceneFrame>
  );
}
