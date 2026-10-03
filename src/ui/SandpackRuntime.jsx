import { useEffect } from 'react';
import {
  SandpackProvider,
  SandpackPreview,
  useSandpack,
} from '@codesandbox/sandpack-react';

// Sits under every executed snippet so the output is centred on the panel's
// own background instead of a white page.
const BASE = `* { box-sizing: border-box; }
html, body, #root {
  height: 100%;
  margin: 0;
}
body {
  display: grid;
  place-items: center;
  padding: 18px;
  background: #0d1018;
  color: #e8e6e1;
  font-family: ui-sans-serif, system-ui, sans-serif;
}
`;

// Sandpack compiles in a remote bundler. When that bundler is blocked or slow,
// nothing arrives and the panel would spin forever, so the page listens for a
// real completion message rather than assuming one.
function ReadyWatch({ onReady }) {
  const { listen } = useSandpack();

  useEffect(() => {
    const stop = listen((msg) => {
      if (msg.type === 'done' || msg.type === 'success') onReady();
    });
    return stop;
  }, [listen, onReady]);

  return null;
}

export default function SandpackRuntime({ tech, onReady }) {
  return (
    <SandpackProvider
      template="react"
      theme="dark"
      files={{
        '/App.js': { code: tech.uiCode },
        '/styles.css': { code: BASE + tech.uiCss },
      }}
      options={{ recompileMode: 'immediate', autorun: true }}
    >
      <ReadyWatch onReady={onReady} />
      <SandpackPreview
        showOpenInCodeSandbox={false}
        showRefreshButton={false}
        showSandpackErrorOverlay={false}
        showNavigator={false}
        style={{ height: '100%', width: '100%', border: 0, background: '#0d1018' }}
      />
    </SandpackProvider>
  );
}
