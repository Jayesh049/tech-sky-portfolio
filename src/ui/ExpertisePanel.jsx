import { useEffect, useRef } from 'react';
import { TechLogo } from './StormField.jsx';
import { finalStory } from '../data/techStory.js';

const Arrow = ({ back = false }) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d={back ? 'M19 12H5M11 6l-6 6 6 6' : 'M5 12h14M13 6l6 6-6 6'} />
  </svg>
);

const Replay = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" />
  </svg>
);

const Tick = () => (
  <svg className="xp-tick" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true" focusable="false">
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1" />
    <path d="M5 8.3l2 2 4-4.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// EXPERTISE: what the storm cleared to. Technology, what it is for, what I do
// with it, and where I have actually used it. Projects stay in their own
// section; this panel only links to it.
export function ExpertisePanel({ tech, story, count, total, isLast, onNext, onReplay }) {
  const headRef = useRef(null);
  useEffect(() => {
    // Keyboard users land on the heading; the page does not scroll for it.
    headRef.current?.focus({ preventScroll: true });
  }, []);

  const xp = story.expertise;
  return (
    <div className="xp" style={{ '--tech': tech.color }}>
      <div className="xp-main">
        <div className="xp-top">
          <p className="xp-kicker">
            <TechLogo id={tech.id} className="xp-logo" />
            {story.display} expertise
          </p>
          <span className="xp-count">
            {count}/{total}
          </span>
        </div>
        <h3 className="xp-head" tabIndex={-1} ref={headRef}>
          {xp.head} <span className="xp-hi">{xp.hi}</span>
        </h3>
        <p className="xp-text">{xp.text}</p>
        <ul className="xp-caps">
          {xp.caps.map((c) => (
            <li key={c}>
              <Tick />
              {c}
            </li>
          ))}
        </ul>
        <p className="xp-evidence">
          <span className="xp-evidence-k">Where I have used it</span>
          {xp.evidence}
        </p>
        <div className="xp-actions">
          <button type="button" className="btn btn-primary xp-btn" onClick={onNext}>
            {isLast ? 'See the full stack' : 'Explore another technology'} <Arrow />
          </button>
          <button type="button" className="btn btn-ghost xp-btn" onClick={onReplay}>
            <Replay /> Replay
          </button>
          {/* RETIRED. The panel already offers the two things a visitor wants
              here -- the next technology, or this one again -- and a third
              link competing with them sent people out of the sequence
              mid-way. #work is still reachable from the header and the
              skills cards.
          <a className="linkish" href="#work">
            View work
          </a> */}
        </div>
      </div>
      <div className="xp-emblem" aria-hidden="true">
        <TechLogo id={tech.id} className="xp-emblem-logo" />
      </div>
    </div>
  );
}

// FINAL_STATE: after every technology. Calm, short, and pointing at the work.
export function FinalPanel({ total, onReplay }) {
  const f = finalStory;
  return (
    <div className="xp xp-final">
      <div className="xp-main">
        <div className="xp-top">
          <p className="xp-kicker">{f.kicker}</p>
          <span className="xp-count">
            {total}/{total}
          </span>
        </div>
        <h3 className="xp-head">
          {f.head} <span className="xp-hi">{f.hi}</span>
        </h3>
        <dl className="xp-areas">
          {f.areas.map((a) => (
            <div key={a.k}>
              <dt>{a.k}</dt>
              <dd>{a.v}</dd>
            </div>
          ))}
        </dl>
        <div className="xp-actions">
          <a className="btn btn-primary xp-btn" href="#work">
            See the work <Arrow />
          </a>
          <button type="button" className="btn btn-ghost xp-btn" onClick={onReplay}>
            <Replay /> Start again
          </button>
        </div>
      </div>
    </div>
  );
}
