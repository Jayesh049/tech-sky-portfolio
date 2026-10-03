import SceneFrame, { on } from './SceneFrame.jsx';

const CHAIN = [
  ['Request', 'GET /api/findings/42'],
  ['Authentication', 'JWT, Azure AD'],
  ['Authorization', 'Roles = "Auditor"'],
  ['Controller', 'FindingsController'],
  ['Service', 'IFindingService'],
];

// .NET: a request passes authentication and a role check, reaches the
// controller and service, and comes back as typed JSON.
export default function DotnetScene({ step, alive, status }) {
  return (
    <SceneFrame title="GET /api/findings/42" status={status} alive={alive} className="art-net">
      <div className="ex-grid">
        <ol className="ex-chain" data-run={alive ? 'true' : 'false'}>
          {CHAIN.map(([k, v], i) => (
            <li key={k} className="ex-node net-node" data-on={on(step, i)} style={{ '--i': i }}>
              {k}
              <code>{v}</code>
            </li>
          ))}
        </ol>
        <div className="ex-side">
          <pre className="net-json" data-on={on(step, 5)}>
            {`{
  "id": 42,
  "site": "Noida-07",
  "severity": "High",
  "status": "Open"
}`}
          </pre>
          <p className="ex-ok" data-on={on(step, 5)}>
            200 OK
          </p>
        </div>
      </div>
    </SceneFrame>
  );
}
