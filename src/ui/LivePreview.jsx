import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import CodePanel from './CodePanel.jsx';
import { useRuntimeReachable } from '../hooks/useEnvironment.js';

// Sandpack ships a whole bundler, so it only arrives when a snippet is about
// to run. One instance at a time, unmounted the moment the sequence settles.
const SandpackRuntime = lazy(() => import('./SandpackRuntime.jsx'));

const BOOT_LIMIT = 9000;

function Shell({ tech, children, note }) {
  return (
    <div className="run" style={{ '--tech': tech.color }}>
      <div className="run-bar">
        <span className="run-live" aria-hidden="true" />
        <span className="run-name">{note || 'running App.js'}</span>
      </div>
      <div className="run-body">{children}</div>
    </div>
  );
}

function Source({ tech }) {
  return (
    <div className="run-offline">
      <CodePanel snippetKey={`${tech.id}:ui`} label="App.js" typing={false} />
    </div>
  );
}

export default function LivePreview({ tech }) {
  const reach = useRuntimeReachable();
  const [state, setState] = useState('booting');

  const onReady = useCallback(() => setState('live'), []);

  // The origin answering is not the same as the bundler working. If no
  // completion message lands in time, show the source rather than a spinner
  // that never resolves.
  useEffect(() => {
    setState('booting');
    const t = setTimeout(
      () => setState((s) => (s === 'booting' ? 'failed' : s)),
      BOOT_LIMIT
    );
    return () => clearTimeout(t);
  }, [tech.id]);

  if (reach === 'down' || state === 'failed') {
    return (
      <Shell tech={tech} note="sandbox unreachable, showing the source">
        <Source tech={tech} />
      </Shell>
    );
  }

  return (
    <Shell tech={tech}>
      <div className="run-stack" data-live={state === 'live' ? 'true' : 'false'}>
        <Suspense fallback={null}>
          {reach === 'up' && <SandpackRuntime tech={tech} onReady={onReady} />}
        </Suspense>
        <div className="run-boot" aria-label="Starting the runtime" />
      </div>
    </Shell>
  );
}
