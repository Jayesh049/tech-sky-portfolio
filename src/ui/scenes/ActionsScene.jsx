import SceneFrame, { on } from './SceneFrame.jsx';

const STAGES = [
  ['Push', 'main @ 3f9c2e1'],
  ['Checkout', 'actions/checkout@v4'],
  ['Test', 'npm ci && npm test'],
  ['Build image', 'docker build'],
  ['Push to ECR', 'ap-south-1'],
  ['Deploy to ECS', 'service: api'],
];

// GitHub Actions: a push runs the workflow stage by stage, from checkout to
// a rolling deploy on AWS.
export default function ActionsScene({ step, alive, status }) {
  return (
    <SceneFrame title="deploy #214" status={status} alive={alive} className="art-gh">
      <ol className="gh-stages">
        {STAGES.map(([k, v], i) => {
          const state = step > i ? 'done' : step === i && step < STAGES.length ? 'run' : 'wait';
          return (
            <li key={k} data-state={state}>
              <span className="gh-ic" aria-hidden="true" />
              <span className="gh-k">{k}</span>
              <code>{v}</code>
            </li>
          );
        })}
      </ol>
      <p className="gh-done" data-on={on(step, 5)}>
        Deployed to AWS in 3m 12s
      </p>
    </SceneFrame>
  );
}
