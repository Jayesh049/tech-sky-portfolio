import SceneFrame, { useTick, on } from './SceneFrame.jsx';

const LOG = [
  ['agent', 'plan: find sources, then quiz'],
  ['call', 'search_textbooks { query: "basal insulin", k: 5 }'],
  ['result', '5 passages, 3 books'],
  ['call', 'make_quiz { topic: "insulin" }'],
  ['result', '4 questions'],
  ['agent', 'answer with sources and a quiz'],
];

// MCP: a server registers tools, opens two transports, and an agent works
// through them with structured calls instead of free text.
export default function McpScene({ step, alive, status }) {
  const n = useTick(alive, 800);
  const upto = alive ? 1 + (n % LOG.length) : step > 5 ? 2 : 0;
  return (
    <SceneFrame title="clinical-edu tools" status={status} alive={alive} className="art-mcp">
      <div className="mcp-grid">
        <div className="mcp-server" data-on={on(step, 0)}>
          <span className="rag-k">MCP server</span>
          <ul className="mcp-tools">
            <li data-on={on(step, 1)}>search_textbooks</li>
            <li data-on={on(step, 2)}>make_quiz</li>
            <li className="mcp-more" data-on={on(step, 2)}>
              + 34 more tools
            </li>
          </ul>
          <div className="mcp-tx">
            <span data-on={on(step, 3)}>stdio</span>
            <span data-on={on(step, 4)}>Streamable HTTP</span>
            <span data-on={on(step, 4)}>REST</span>
          </div>
        </div>
        <ol className="mcp-log" data-on={on(step, 5)}>
          {LOG.slice(0, Math.max(upto, 0)).map(([k, v], i) => (
            <li key={i} data-k={k}>
              <span>{k === 'call' ? '→' : k === 'result' ? '←' : '◆'}</span>
              {v}
            </li>
          ))}
        </ol>
      </div>
    </SceneFrame>
  );
}
