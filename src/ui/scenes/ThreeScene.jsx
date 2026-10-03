import SceneFrame, { on } from './SceneFrame.jsx';

const FACES = ['front', 'back', 'left', 'right', 'top', 'bottom'];

// Three.js: an empty scene gets a camera, a geometry, a material, a light,
// and then it moves. Each step is one line of the code on the left.
export default function ThreeScene({ step, alive, status }) {
  return (
    <SceneFrame title="3D scene" status={status} alive={alive} className="art-3d">
      <div className="t3-stage" data-scene={on(step, 0)} data-cam={on(step, 1)} data-geo={on(step, 2)} data-mat={on(step, 3)} data-light={on(step, 4)} data-anim={on(step, 5)}>
        <span className="t3-floor" />
        <span className="t3-camera" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.3">
            <rect x="2" y="7" width="14" height="10" rx="2" />
            <path d="M16 11l6-3v8l-6-3z" />
          </svg>
        </span>
        <span className="t3-light" />
        <div className="t3-orbit">
          {Array.from({ length: 8 }, (_, i) => (
            <i key={i} style={{ '--k': i }} />
          ))}
        </div>
        <div className="t3-cube">
          {FACES.map((f) => (
            <span key={f} className={`t3-face t3-${f}`} />
          ))}
        </div>
      </div>
      <ul className="t3-steps">
        {['Scene', 'Camera', 'Geometry', 'Material', 'Light', 'Animation'].map((k, i) => (
          <li key={k} data-on={on(step, i)}>
            {k}
          </li>
        ))}
      </ul>
    </SceneFrame>
  );
}
