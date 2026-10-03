import SceneFrame, { useTick, on } from './SceneFrame.jsx';

const DOCS = [
  { userId: 1024, name: 'Jayesh', role: 'admin', active: true },
  { userId: 1025, name: 'Riya', role: 'user', active: true },
  { userId: 1026, name: 'Kabir', role: 'user', active: false },
];
const RESULT = [
  ['user', 245],
  ['editor', 31],
  ['admin', 12],
];

// MongoDB: documents flow through $match, $group and $sort into a result.
export default function MongoScene({ step, alive, status }) {
  const n = useTick(alive, 900);
  return (
    <SceneFrame title="Aggregation pipeline" status={status} alive={alive} className="art-mg">
      <div className="mg-grid">
        <ul className="mg-docs" data-on={on(step, 0)}>
          {DOCS.map((d, i) => (
            <li
              key={d.userId}
              className="mg-doc"
              data-out={step > 1 && !d.active ? 'true' : 'false'}
              data-hot={alive && n % 3 === i ? 'true' : 'false'}
            >
              {`{ userId: ${d.userId}, name: "${d.name}", role: "${d.role}", active: ${d.active} }`}
            </li>
          ))}
        </ul>
        <ol className="mg-stages" data-run={alive ? 'true' : 'false'}>
          {['$match', '$group', '$sort'].map((k, i) => (
            <li key={k} data-on={on(step, i + 1)}>
              {k}
            </li>
          ))}
        </ol>
        <ul className="mg-result" data-on={on(step, 4)}>
          {RESULT.map(([k, v]) => (
            <li key={k} style={{ '--w': v / 245 }}>
              <span className="mg-k">{k}</span>
              <span className="mg-bar" />
              <span className="mg-v">{v}</span>
            </li>
          ))}
        </ul>
      </div>
    </SceneFrame>
  );
}
