import SceneFrame, { on } from './SceneFrame.jsx';

const LAYERS = ['Request', 'Controller', 'Service', 'Repository', 'Database'];

// Spring Boot: a request goes down through the layers, the answer comes back
// up, and the pieces of the service come together.
export default function SpringScene({ step, alive, status }) {
  return (
    <SceneFrame title="GET /api/users/42" status={status} alive={alive} className="art-sp">
      <div className="sp-grid">
        <ol className="sp-layers" data-run={step > 5 ? 'true' : 'false'}>
          {LAYERS.map((k, i) => (
            <li key={k} className="sp-layer" data-on={on(step, i)} style={{ '--i': i }}>
              {k}
            </li>
          ))}
        </ol>
        <div className="sp-side">
          <p className="sp-ok" data-on={on(step, 5)}>
            200 OK
          </p>
          <ul className="sp-chips" data-join={alive ? 'true' : 'false'}>
            {['JWT', 'Database', 'API', 'Service'].map((k, i) => (
              <li key={k} style={{ '--i': i }}>
                {k}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SceneFrame>
  );
}
