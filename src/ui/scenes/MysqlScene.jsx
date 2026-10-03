import SceneFrame, { on } from './SceneFrame.jsx';

const TABLES = [
  { id: 'users', x: 8, y: 8, cols: ['id', 'name'] },
  { id: 'orders', x: 112, y: 8, cols: ['id', 'user_id', 'product_id'] },
  { id: 'products', x: 216, y: 8, cols: ['id', 'title'] },
  { id: 'payments', x: 112, y: 92, cols: ['order_id', 'status'] },
];
const LINKS = [
  ['M84 30 H112', 'users'],
  ['M188 34 H216', 'products'],
  ['M150 70 V92', 'payments'],
];
const ROWS = [
  ['Aman', 17],
  ['Rahul', 12],
  ['Pooja', 8],
];

// MySQL: tables, the joins between them, the query travelling through the
// joins, and the rows it returns.
export default function MysqlScene({ step, alive, status }) {
  const hot = (id) => (step === 3 && (id === 'payments')) || (step === 4 && (id === 'users' || id === 'orders'));
  return (
    <SceneFrame title="Relational query" status={status} alive={alive} className="art-sql">
      <svg className="sql-map" viewBox="0 0 300 150" aria-hidden="true" data-on={on(step, 0)} data-run={step > 1 ? 'true' : 'false'}>
        {LINKS.map(([d, k]) => (
          <path key={k} className="sql-link" d={d} data-on={on(step, 1)} />
        ))}
        {TABLES.map((t) => (
          <g key={t.id} className="sql-table" data-hot={hot(t.id) ? 'true' : 'false'} transform={`translate(${t.x} ${t.y})`}>
            <rect width="76" height={20 + t.cols.length * 13} rx="5" />
            <text className="sql-name" x="8" y="14">
              {t.id.toUpperCase()}
            </text>
            {t.cols.map((c, i) => (
              <text key={c} className="sql-col" x="8" y={30 + i * 13}>
                {c}
              </text>
            ))}
          </g>
        ))}
      </svg>
      <table className="sql-result" data-on={on(step, 4)}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Orders</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([k, v]) => (
            <tr key={k}>
              <td>{k}</td>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SceneFrame>
  );
}
