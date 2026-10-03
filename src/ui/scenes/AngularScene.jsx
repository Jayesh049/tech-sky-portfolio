import SceneFrame, { useTick, on } from './SceneFrame.jsx';

const ROWS = [
  ['Fire exit signage missing', 'High'],
  ['UPS log not signed', 'Medium'],
  ['Access badge audit overdue', 'High'],
  ['Server room humidity', 'Low'],
];

// Angular: a component, its template, a service feeding it, a computed
// signal counting what is open, and the events that change it.
export default function AngularScene({ step, alive, status }) {
  const n = useTick(alive, 1100);
  const closed = alive ? n % (ROWS.length + 1) : 0;
  const open = ROWS.length - closed;
  return (
    <SceneFrame title="Findings" status={status} alive={alive} className="art-ng">
      <div className="ng-head" data-on={on(step, 0)}>
        <span className="ng-h">Findings</span>
        <span className="ng-count" data-on={on(step, 3)} key={`c${open}`}>
          {open} open
        </span>
      </div>
      <ul className="ng-rows" data-on={on(step, 1)}>
        {ROWS.map(([t, sev], i) => {
          const done = i < closed;
          return (
            <li key={t} data-done={done ? 'true' : 'false'}>
              <span className="ng-sev" data-sev={sev} />
              <span className="ng-t">{step > 2 ? t : ' '}</span>
              <span className="ng-st">{done ? 'Resolved' : 'Open'}</span>
              <span className="ng-btn" data-on={on(step, 4)}>
                Resolve
              </span>
            </li>
          );
        })}
      </ul>
    </SceneFrame>
  );
}
