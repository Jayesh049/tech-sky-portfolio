import SceneFrame, { useTick, on } from './SceneFrame.jsx';

const LINES = [
  'Insulin moves glucose from the blood into cells.',
  'Basal insulin covers the body between meals.',
  'Bolus insulin covers the carbohydrate in a meal.',
];

// Next.js: a route renders on the server, pulls its data through Prisma,
// asks the agent, and streams the page to the client.
export default function NextScene({ step, alive, status }) {
  const n = useTick(alive, 700);
  const shown = alive ? 1 + (n % (LINES.length + 2)) : step > 4 ? LINES.length : 0;
  return (
    <SceneFrame title="/topics/insulin-basics" status={status} alive={alive} className="art-nx">
      <ol className="nx-pipe">
        {['Route', 'Server', 'Prisma', 'Agent', 'Stream'].map((k, i) => (
          <li key={k} data-on={on(step, i)}>
            {k}
          </li>
        ))}
      </ol>
      <article className="nx-page" data-on={on(step, 1)}>
        <p className="nx-title">{step > 2 ? 'Insulin basics' : ' '}</p>
        <ul className="nx-src" data-on={on(step, 3)}>
          <li>[1] Endocrinology, ch. 4</li>
          <li>[2] Pharmacology, ch. 11</li>
        </ul>
        <div className="nx-text">
          {LINES.map((l, i) => (
            <p key={l} data-on={i < shown ? 'true' : 'false'}>
              {l}
            </p>
          ))}
          <span className="nx-skel" data-on={shown < LINES.length ? 'true' : 'false'} />
        </div>
      </article>
    </SceneFrame>
  );
}
