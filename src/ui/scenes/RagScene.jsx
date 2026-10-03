import SceneFrame, { useTick, on } from './SceneFrame.jsx';

// RAG: documents into chunks, chunks into vectors, vectors into a store; a
// question pulls back the closest five and the answer cites them.
export default function RagScene({ step, alive, status }) {
  const n = useTick(alive, 1000);
  const hot = new Set([2, 7, 11, 16, 21].map((k) => (k + n * 3) % 24));
  return (
    <SceneFrame title="Retrieval-augmented answer" status={status} alive={alive} className="art-rag">
      <div className="rag-row">
        <div className="rag-col" data-on={on(step, 0)}>
          <span className="rag-k">Docs</span>
          <div className="rag-docs">
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className="rag-col" data-on={on(step, 1)}>
          <span className="rag-k">Chunks</span>
          <div className="rag-chunks">
            {Array.from({ length: 24 }, (_, i) => (
              <i key={i} data-hit={step > 4 && hot.has(i) ? 'true' : 'false'} />
            ))}
          </div>
        </div>
        <div className="rag-col" data-on={on(step, 2)}>
          <span className="rag-k">Vectors</span>
          <code className="rag-vec">[0.12, -0.44, 0.08, ...]</code>
        </div>
        <div className="rag-col" data-on={on(step, 3)}>
          <span className="rag-k">Store</span>
          <span className="rag-db" />
        </div>
      </div>
      <p className="rag-q" data-on={on(step, 4)}>
        Q: What does basal insulin cover?
      </p>
      <p className="rag-a" data-on={on(step, 5)}>
        The body between meals, including overnight <span>[1]</span>, at a steady low rate <span>[3]</span>.
      </p>
    </SceneFrame>
  );
}
