import { useEffect, useRef, useState } from "react";
import { ICONS } from "./HeroPaths.jsx";

export const DEFAULT_INTRO = {
  eyebrow: "Introduction",
  greeting: "Hey, I'm",
  name: "Jayesh Kumar Singh",
  role: "A Full-Stack Developer & AI Enthusiast",
  // Author's own copy, kept verbatim. The em dashes are deliberate, which is
  // why scripts/selftest.mjs exempts the .cir-intro subtree from the em-dash
  // gate (banned stock words are still checked here). The original bundle
  // lede is below; it tripped the "solutions" rule.
  // lede: "I build scalable products, solve real-world problems, and love turning ideas into impactful solutions.",
  lede:
    "A sharp observer and creative problem-solver—I find the right path, think beyond the obvious, and turn ideas into lovely outcomes with GenAI. I’m an approach-finder, path-maker, and perfectionist—turning ideas into reality through inventive thinking and GenAI.",
  // Same remapping as DEFAULT_PATHS in HeroPaths.jsx; see the note there.
  // Originals: #work / #projects / #skills / #about.
  links: [
    { key: "work", title: "Work", sub: "Experience", href: "#experience" },
    { key: "projects", title: "Projects", sub: "Ideas to reality", href: "#work" },
    { key: "skills", title: "Skills", sub: "Tools & tech", href: "#stack" },
    { key: "about", title: "About", sub: "My story", href: "#about" },
  ],
};

/**
 * The layer under the portfolio sheet: the same background video, now sharp
 * and large, with the introduction beside it. It exists in the DOM from the
 * start (so the folded corner shows it) but is inert until the sheet is gone.
 *
 * The video loads when the corner first appears, plays while any of it is
 * visible, and pauses when the sheet is back or nobody can see it.
 */
export default function IntroReveal({
  peel, //       the page-peel state (usePagePeel)
  focusRef, //   receives focus when the layer is revealed
  loop, //       { webm, mp4 } factory: (width) => sources
  poster,
  intro = DEFAULT_INTRO,
}) {
  const video = useRef(null);
  const root = useRef(null);
  const [sources, setSources] = useState(null);
  const [paused, setPaused] = useState(false);
  const userPaused = useRef(false);
  const onScreen = useRef(true);

  const revealed = peel === "peeled";
  const showing = peel !== "idle" && peel !== "ready";

  // Load once the corner appears: by the time anyone pulls it, it's ready.
  useEffect(() => {
    if (peel === "idle" || sources) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || navigator.connection?.saveData) return;
    const width = window.matchMedia("(min-width: 768px)").matches ? 1112 : 640;
    setSources(loop(width));
  }, [peel, sources, loop]);

  useEffect(() => {
    const v = video.current;
    if (!v || !sources) return;
    v.muted = true;
    v.load();
  }, [sources]);

  // Play while it's showing; pause when the page covers it again.
  useEffect(() => {
    const v = video.current;
    if (!v || !sources) return;
    if (showing && !userPaused.current && onScreen.current && !document.hidden) v.play().catch(() => {});
    if (!showing) v.pause();
  }, [showing, sources]);

  useEffect(() => {
    const v = video.current;
    const el = root.current;
    if (!v || !el) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      onScreen.current = Boolean(entry?.isIntersecting);
      if (!onScreen.current) v.pause();
      else if (showing && !userPaused.current) v.play().catch(() => {});
    });
    io.observe(el);
    const onVis = () => {
      if (document.hidden) v.pause();
      else if (showing && !userPaused.current && onScreen.current) v.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [showing]);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    userPaused.current = !userPaused.current;
    setPaused(userPaused.current);
    if (userPaused.current) v.pause();
    else v.play().catch(() => {});
  };

  // Inert until revealed: nothing under the sheet can be tabbed to. Set on
  // the element directly, so it works the same on React 18 and 19.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (revealed) el.removeAttribute("inert");
    else el.setAttribute("inert", "");
  }, [revealed]);

  return (
    <div
      ref={root}
      className="cir-intro"
      data-revealed={revealed ? "true" : "false"}
      aria-hidden={revealed ? undefined : "true"}
    >
      <div className="cir-intro__media">
        <video
          ref={video}
          className="cir-intro__video"
          muted
          loop
          playsInline
          preload="none"
          poster={poster}
          aria-hidden="true"
          tabIndex={-1}
        >
          {sources ? (
            <>
              <source src={sources.webm} type="video/webm" />
              <source src={sources.mp4} type="video/mp4" />
            </>
          ) : null}
        </video>
        <div className="cir-intro__grade" aria-hidden="true" />
        {sources ? (
          <button
            type="button"
            className="cir-intro__play"
            aria-pressed={!paused}
            aria-label={paused ? "Play video" : "Pause video"}
            onClick={toggle}
          >
            {/* No glyph: the button is a transparent sheet over the whole
                picture now, so tapping the video is what plays and pauses it.
                aria-label above still says which action the press performs,
                and aria-pressed still reports the state, so nothing is lost
                for anyone who cannot see the video change.

                RETIRED play/pause icons:
            {paused ? (
              <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                <path d="M7 4.5l9 5.5-9 5.5z" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                <path d="M6 4.5h2.6v11H6zM11.4 4.5H14v11h-2.6z" fill="currentColor" />
              </svg>
            )} */}
          </button>
        ) : null}
      </div>

      <div className="cir-intro__body">
        <p className="cir-intro__eyebrow">{intro.eyebrow}</p>
        <h2 ref={focusRef} className="cir-intro__title" tabIndex={-1}>
          {intro.greeting} <span className="cir-intro__name">{intro.name}</span>
        </h2>
        <p className="cir-intro__role">{intro.role}</p>
        <p className="cir-intro__lede">{intro.lede}</p>
        <nav className="cir-intro__nav" aria-label="Explore the portfolio">
          {intro.links.map((l) => (
            <a key={l.key} className="cir-intro__link" href={l.href}>
              <svg
                className="cir-intro__icon"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                aria-hidden="true"
                focusable="false"
              >
                {ICONS[l.icon ?? l.key] ?? ICONS.work}
              </svg>
              <span className="cir-intro__link-text">
                <span className="cir-intro__link-title">{l.title}</span>
                <span className="cir-intro__link-sub">{l.sub}</span>
              </span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
