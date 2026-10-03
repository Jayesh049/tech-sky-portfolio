import SceneFrame, { useTick, on } from './SceneFrame.jsx';

const LAYERS = [
  ['FROM node:20-alpine', '7.8 MB'],
  ['RUN npm ci', '41 MB'],
  ['RUN npm run build', '2.1 MB'],
  ['runtime: dist + node_modules', '49 MB'],
];
const BOXES = ['mailer-1', 'mailer-2', 'api', 'worker'];

// Docker: the image builds layer by layer, gets a health check, and runs as
// a set of healthy containers.
export default function DockerScene({ step, alive, status }) {
  const n = useTick(alive, 900);
  return (
    <SceneFrame title="mailer:1.4" status={status} alive={alive} className="art-dk">
      <ol className="dk-layers">
        {LAYERS.map(([k, s], i) => (
          <li key={k} data-on={on(step, i)} style={{ '--i': i }}>
            <code>{k}</code>
            <span>{s}</span>
          </li>
        ))}
      </ol>
      <p className="dk-health" data-on={on(step, 4)}>
        HEALTHCHECK /health every 30s
      </p>
      <ul className="dk-boxes" data-on={on(step, 5)}>
        {BOXES.map((b, i) => (
          <li key={b} data-beat={alive && n % BOXES.length === i ? 'true' : 'false'}>
            <span className="dk-dot" />
            {b}
            <span className="dk-st">healthy</span>
          </li>
        ))}
      </ul>
    </SceneFrame>
  );
}
