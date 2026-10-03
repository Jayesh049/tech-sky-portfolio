import { useRef, useState } from 'react';
import { techs } from '../data/techs.js';
import { profile, disciplines, skillsHead, work, experience } from '../data/profile.js';
import { formReady } from '../data/contact.js';
import ContactForm from './ContactForm.jsx';
import { logoUrl } from '../scene/ExtrudedLogo.jsx';
import { useStore } from '../store.js';
import CodePanel from './CodePanel.jsx';
import TypedLine from './TypedLine.jsx';
import SkillArt, { RowMark } from './SkillArt.jsx';

const asset = (p) => `${import.meta.env.BASE_URL}${p}`;

// The About section's skills band sits on a dark ridge line with a faint arc
// of light behind it, drawn once. Decorative.
function SkillsBackdrop() {
  return (
    <svg className="skills-backdrop" viewBox="0 0 1440 520" preserveAspectRatio="xMidYMax slice" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="skb-glow" cx="0.5" cy="0.62" r="0.5">
          {/* Recoloured with the rest of the section. The arc of light was
              amber (#f2b36b -> #8a5a2c); white at the same 0.2 reads far
              brighter than amber did, so the near stop drops to 0.1. */}
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="0.55" stopColor="#8c8c8c" stopOpacity="0.05" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="skb-rock" x1="0" y1="0" x2="0" y2="1">
          {/* was #15120f -> #07070a: a brown-black ridge, now a neutral one */}
          <stop offset="0" stopColor="#161616" />
          <stop offset="1" stopColor="#0b0b0b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="1440" height="520" fill="url(#skb-glow)" />
      <ellipse cx="720" cy="470" rx="560" ry="300" stroke="#edebe7" strokeOpacity="0.12" strokeDasharray="2 7" />
      <ellipse cx="720" cy="470" rx="470" ry="240" stroke="#edebe7" strokeOpacity="0.07" />
      <path d="M0 420L90 372 170 398 260 330 330 356 410 290 470 318 540 268 600 300 660 250 720 214 780 252 850 236 920 286 990 262 1060 310 1130 282 1210 336 1290 312 1370 360 1440 342V520H0z" fill="url(#skb-rock)" />
      <path d="M0 420L90 372 170 398 260 330 330 356 410 290 470 318 540 268 600 300 660 250 720 214 780 252 850 236 920 286 990 262 1060 310 1130 282 1210 336 1290 312 1370 360 1440 342" stroke="#edebe7" strokeOpacity="0.22" />
      <path d="M0 470L120 430 230 452 350 402 470 428 590 380 720 344 850 384 980 356 1100 404 1230 380 1340 420 1440 404V520H0z" fill="#0b0b0b" fillOpacity="0.85" />
      <path d="M0 470L120 430 230 452 350 402 470 428 590 380 720 344 850 384 980 356 1100 404 1230 380 1340 420 1440 404" stroke="#edebe7" strokeOpacity="0.12" />
    </svg>
  );
}

export function About() {
  return (
    <section className="sec sec-about" id="about">
      <div className="wrap">
        <TypedLine text={'const jayesh = { role: "Full-Stack Engineer" }'} />

        <div className="about-grid">
          <div className="about-main" data-reveal>
            <h2 className="h2">{profile.aboutHead}</h2>
            {profile.about.map((p, i) => (
              <p className="lede" key={i}>
                {p}
              </p>
            ))}
          </div>

          <ul className="facts" data-reveal>
            {profile.facts.map((f) => (
              <li key={f.k}>
                <b>{f.k}</b>
                <span>{f.v}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="skills-head" data-reveal>
          <SkillsBackdrop />
          <p className="skills-eyebrow">{skillsHead.eyebrow}</p>
          <h3 className="skills-title">
            {skillsHead.title.slice(0, skillsHead.title.indexOf(skillsHead.hi))}
            <span className="skills-hi">{skillsHead.hi}</span>
          </h3>
          <p className="skills-lede">{skillsHead.lede}</p>
          <dl className="skills-stats">
            <div>
              <dt>Domains</dt>
              <dd>{disciplines.length}</dd>
            </div>
            <div>
              <dt>Technologies</dt>
              <dd>{techs.length}+</dd>
            </div>
            <div>
              <dt>Years shipping</dt>
              <dd>{parseInt(profile.facts[0].k, 10)}</dd>
            </div>
          </dl>
        </div>

        <div className="disciplines" data-reveal>
          {disciplines.map((d, i) => (
            <article className="disc" key={d.title}>
              <span className="disc-corner" aria-hidden="true" />
              <div className="disc-body">
                <span className="disc-no" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="disc-h">{d.title}</h3>
                <p className="disc-line">{d.line}</p>
                <ul>
                  {d.skills.map((s) => (
                    <li key={s}>
                      <RowMark />
                      {s}
                    </li>
                  ))}
                </ul>
                {d.more ? (
                  <a className="disc-more" href={d.more.href}>
                    {d.more.label}
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </a>
                ) : null}
              </div>
              <SkillArt index={i} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Stack() {
  const landed = useStore((s) => s.landed);

  return (
    <section className="sec sec-stack" id="stack">
      <div className="wrap">
        <TypedLine text={'techs.map((t) => extrude(t.logoSvg))'} />
        <h2 className="h2 h2-wide">
          Ten technologies, each one drawn from its own path data.
        </h2>
        <p className="lede lede-wide">
          Nothing on this page is an image of a logo. Every mark up in that sky is an
          SVG path turned into geometry at runtime, and the panel beside it is the code
          that did it.
        </p>

        <div className="stack-grid">
          {techs.map((t) => (
            <article
              className="tcard"
              key={t.id}
              style={{ '--tech': t.color }}
              data-landed={landed.includes(t.id) ? 'true' : 'false'}
              data-reveal
            >
              <div className="tcard-head">
                <img
                  className="tcard-logo"
                  src={logoUrl(t.id)}
                  alt=""
                  width="28"
                  height="28"
                  loading="lazy"
                  decoding="async"
                />
                <div>
                  <h3 className="tcard-name">{t.name}</h3>
                  <p className="tcard-blurb">{t.blurb}</p>
                </div>
              </div>
              <div className="tcard-code">
                <CodePanel snippetKey={`${t.id}:logo`} label={`${t.id}.js`} typing={false} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Work() {
  return (
    <section className="sec sec-work" id="work">
      <div className="wrap">
        <TypedLine text={'git log --author="jayesh" --oneline'} />
        <h2 className="h2 h2-wide">Things I built end to end.</h2>

        <div className="work-list">
          {work.map((p, i) => (
            <article className="proj" key={p.name} data-flip={i % 2 ? 'true' : 'false'} data-reveal>
              <a className="proj-shot" href={p.live} target="_blank" rel="noreferrer">
                <img
                  src={asset(p.image)}
                  alt={`Screenshot of ${p.name}`}
                  loading="lazy"
                  decoding="async"
                  width="1340"
                  height="768"
                />
              </a>

              <div className="proj-body">
                <p className="proj-kind">
                  <span>{p.kind}</span>
                  <span className="proj-year">{p.year}</span>
                </p>
                <h3 className="proj-name">{p.name}</h3>
                <p className="proj-desc">{p.description}</p>
                <ul className="proj-stack">
                  {p.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                <div className="proj-links">
                  <a className="btn btn-small" href={p.live} target="_blank" rel="noreferrer">
                    Open it
                  </a>
                  <a className="linkish" href={p.code} target="_blank" rel="noreferrer">
                    Read the source
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Experience() {
  return (
    <section className="sec sec-exp" id="experience">
      <div className="wrap">
        <TypedLine text={'SELECT * FROM roles ORDER BY started DESC;'} />
        <h2 className="h2 h2-wide">Where the four years went.</h2>

        <ol className="timeline">
          {experience.map((e) => (
            <li className="job" key={e.company + e.date} data-current={e.current ? 'true' : 'false'} data-reveal>
              <div className="job-when">
                <span className="job-node" aria-hidden="true" />
                {e.date}
              </div>
              <div className="job-what">
                <h3 className="job-title">{e.title}</h3>
                <p className="job-co">{e.company}</p>
                <ul className="job-points">
                  {e.points.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Contact() {
  const [writing, setWriting] = useState(false);
  const ctaRef = useRef(null);

  // Closing the form puts the keyboard back on the button that opened it,
  // rather than dropping focus to the top of the document.
  const close = () => {
    setWriting(false);
    requestAnimationFrame(() => ctaRef.current?.focus());
  };

  return (
    <section className="sec sec-contact" id="contact" data-reveal>
      <div className="wrap wrap-narrow">
        <TypedLine text={"await fetch('/hire', { method: 'POST' })"} />
        <h2 className="h2 h2-big">Got something that needs building?</h2>
        <p className="lede">
          Tell me what it is and what is going wrong with it. I answer every email,
          usually the same day.
        </p>

        {/* Three states, in order of preference:
            - no key configured yet -> the plain mailto link this always was,
              because a form that posts nowhere is worse than no form at all;
            - key configured, closed -> a button that opens the form in place;
            - open -> the form, with the mailto still reachable inside it. */}
        {!formReady() ? (
          <a className="btn btn-primary btn-big" href={profile.cta.href}>
            {profile.cta.label}
          </a>
        ) : writing ? (
          <ContactForm onClose={close} />
        ) : (
          <button
            ref={ctaRef}
            type="button"
            className="btn btn-primary btn-big"
            onClick={() => setWriting(true)}
          >
            {profile.cta.label}
          </button>
        )}

        <ul className="links">
          {profile.links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href.startsWith('http') || l.href.startsWith('mailto') ? l.href : asset(l.href)}
                target={l.href.startsWith('mailto') ? undefined : '_blank'}
                rel="noreferrer"
              >
                <span className="link-label">{l.label}</span>
                <span className="link-value">{l.short}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Nav() {
  const items = [
    ['about', 'About'],
    ['stack', 'Stack'],
    ['work', 'Work'],
    ['film', 'Film'],
    ['experience', 'Experience'],
    ['contact', 'Contact'],
  ];

  return (
    <nav className="nav" aria-label="Sections">
      <a className="nav-mark" href="#top">
        <span className="nav-initials">JS</span>
        <span className="nav-name">{profile.name}</span>
      </a>
      <ul>
        {items.map(([id, label]) => (
          <li key={id} data-key={id}>
            <a href={`#${id}`}>{label}</a>
          </li>
        ))}
      </ul>
      <a className="btn btn-small btn-primary nav-cta" href={profile.cta.href}>
        Email me
      </a>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot-in">
        <p>
          Built with React Three Fiber, GSAP and a lot of restraint. The sky is the
          Preetham atmospheric model, not a gradient.
        </p>
        <p className="foot-meta">
          {profile.name}, {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
