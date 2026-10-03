import SceneFrame, { on } from './SceneFrame.jsx';

// LLMs: a template with slots, a model call, an output that fails one check,
// a retry with feedback, and a validated draft that goes to the mailer.
export default function LlmScene({ step, alive, status }) {
  const retried = step > 4;
  return (
    <SceneFrame title="Finding summary" status={status} alive={alive} className="art-llm">
      <div className="llm-tpl" data-on={on(step, 0)}>
        <span className="llm-k">summarize-finding</span>
        <code>
          {'finding: '}
          <b>{'{record.text}'}</b>
          {'  audience: '}
          <b>site manager</b>
          {'  maxWords: '}
          <b>80</b>
        </code>
      </div>
      <div className="llm-call" data-on={on(step, 1)}>
        <span className="llm-model">Model</span>
        <span className="llm-arrow" data-run={step === 2 || alive ? 'true' : 'false'} />
        <span className="llm-out" data-on={on(step, 2)}>
          {retried ? '74 words, neutral, cites the audit' : '112 words'}
        </span>
      </div>
      <ul className="llm-checks" data-on={on(step, 3)}>
        <li data-ok="true">Schema</li>
        <li data-ok={retried ? 'true' : 'false'}>Length {retried ? '' : '(112 > 80)'}</li>
        <li data-ok="true">Tone</li>
        <li className="llm-retry" data-on={on(step, 4)}>
          Retried once with feedback
        </li>
      </ul>
      <div className="llm-mail" data-on={on(step, 5)}>
        <span className="llm-k">Draft to site manager</span>
        <p>Finding 42, Noida-07: fire exit signage is missing on level 2. Fix by Friday; photo evidence closes it.</p>
      </div>
    </SceneFrame>
  );
}
