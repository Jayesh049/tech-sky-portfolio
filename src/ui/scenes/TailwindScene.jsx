import SceneFrame, { useTick } from './SceneFrame.jsx';

const CLASSES = ['<article>', 'p-6 rounded-xl', 'grid gap-4', 'text-lg tracking-tight', 'bg-slate-900 text-white shadow-xl', 'sm:max-w-lg'];
const SIZES = [
  ['Desktop', '100%'],
  ['Tablet', '74%'],
  ['Mobile', '50%'],
];

// Tailwind CSS: a raw element picks up one group of utilities per step and
// turns into a finished, responsive card.
export default function TailwindScene({ step, alive, status }) {
  const n = useTick(alive, 1300);
  const levels = Array.from({ length: Math.min(step, 6) }, (_, i) => `lv${i + 1}`).join(' ');
  const [label, width] = alive ? SIZES[n % 3] : SIZES[0];
  return (
    <SceneFrame title="Utility classes" status={status} alive={alive} className="art-tw">
      <ul className="tw-classes">
        {CLASSES.map((c, i) => (
          <li key={c} data-on={step > i ? 'true' : 'false'}>
            {c}
          </li>
        ))}
      </ul>
      <div className="tw-device" style={{ '--vw': width }}>
        <span className="tw-size">{step > 5 ? label : 'Preview'}</span>
        <article className={`tw-card ${levels}`}>
          <span className="tw-avatar" />
          <div className="tw-text">
            <h4>Beautiful UI</h4>
            <span className="tw-btn">Get started</span>
          </div>
        </article>
      </div>
    </SceneFrame>
  );
}
