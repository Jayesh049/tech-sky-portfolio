import SceneFrame, { on } from './SceneFrame.jsx';

// The fallback for a technology without a bespoke scene: its build steps,
// drawn as a working pipeline. An 11th technology runs with this until it
// gets a scene of its own.
export default function GenericScene({ step, alive, status, story }) {
  return (
    <SceneFrame title={story.build.title} status={status} alive={alive} className="art-gen">
      <ol className="gen-flow" data-run={alive ? 'true' : 'false'}>
        {story.build.steps.map((s, i) => (
          <li key={s.label} data-on={on(step, i)}>
            {s.label}
          </li>
        ))}
      </ol>
    </SceneFrame>
  );
}
