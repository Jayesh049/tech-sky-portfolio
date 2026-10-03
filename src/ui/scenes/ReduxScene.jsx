import SceneFrame, { useTick, on } from './SceneFrame.jsx';

// Redux: one action, one reducer, one store, every component updated at once.
export default function ReduxScene({ step, alive, status }) {
  const n = useTick(alive, 1400);
  const count = alive ? 1 + n : step > 3 ? 1 : 0;
  return (
    <SceneFrame title="State flow" status={status} alive={alive} className="art-rd">
      <ol className="rd-flow">
        <li className="rd-box" data-on={on(step, 0)}>
          <span className="rd-k">Action</span>
          <code key={`a${count}`} className="rd-action">
            {'{ type: "INCREMENT" }'}
          </code>
        </li>
        <li className="rd-box" data-on={on(step, 1)}>
          <span className="rd-k">Reducer</span>
          <code>count + 1</code>
        </li>
        <li className="rd-box rd-store" data-on={on(step, 2)}>
          <span className="rd-k">Store</span>
          <code key={`s${count}`} className="rd-flash">{`{ count: ${count} }`}</code>
        </li>
      </ol>
      <ul className="rd-comps" data-on={on(step, 3)}>
        {['Header badge', 'Counter', 'Cart total'].map((k) => (
          <li key={k}>
            <span className="rd-k">{k}</span>
            <span key={`${k}${count}`} className="rd-num rd-flash">
              {k === 'Cart total' ? `₹${count * 499}` : count}
            </span>
          </li>
        ))}
      </ul>
    </SceneFrame>
  );
}
