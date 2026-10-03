import SceneFrame, { useTick, on } from './SceneFrame.jsx';

const NODES = [
  { k: 'Data', v: (fixed) => (fixed ? '{ id: 42 }' : "{ id: '42' }") },
  { k: 'Type', v: () => 'interface User' },
  { k: 'Function', v: () => 'getUser(id: number)' },
  { k: 'Validation', v: () => 'row exists, else throw' },
  { k: 'Safe output', v: () => 'User' },
];

// TypeScript: loose data gets a shape, the shape guards a function, and the
// compiler catches the one call that would have broken it.
export default function TypeScriptScene({ step, alive, status }) {
  const n = useTick(alive, 1200);
  const fixed = step > 6;
  return (
    <SceneFrame title="Type-safe flow" status={status} alive={alive} className="art-ts">
      <ol className="ts-flow" data-run={alive ? 'true' : 'false'}>
        {NODES.map((node, i) => (
          <li key={node.k} className="ts-node" data-on={on(step, i)} data-hot={alive && n % 5 === i ? 'true' : 'false'}>
            <span className="ts-k">{node.k}</span>
            <code className="ts-v">{node.v(fixed)}</code>
          </li>
        ))}
      </ol>
      <div className="ts-checks">
        <p className="ts-err" data-on={on(step, 5)} data-gone={fixed ? 'true' : 'false'}>
          <span aria-hidden="true">✕</span> getUser('42'): string is not assignable to number
        </p>
        <p className="ts-ok" data-on={on(step, 6)}>
          <span aria-hidden="true">✓</span> getUser(42): number in, User out
        </p>
      </div>
    </SceneFrame>
  );
}
