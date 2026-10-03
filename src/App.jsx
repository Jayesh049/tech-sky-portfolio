import { useEffect } from 'react';
import Hero from './ui/Hero.jsx';
import { About, Stack, Work, Experience, Contact, Nav, Footer } from './ui/Sections.jsx';
import Film from './ui/Film.jsx';
import NewsBar from './theme/components/NewsBar.jsx';
import SiteHeader from './theme/components/SiteHeader.jsx';
import HeroVideo from './theme/components/HeroVideo.jsx';
import SiteFooter from './theme/components/SiteFooter.jsx';
import ErrorBoundary from './ui/ErrorBoundary.jsx';
import { useReveal } from './hooks/useEnvironment.js';
import { useScrollMotion } from './motion/scrollDriver.js';
import { profile } from './data/profile.js';

function HeroFallback() {
  return (
    <section className="hero hero-flat" id="top">
      <div className="sky-flat" aria-hidden="true" />
      <div className="hero-scrim" aria-hidden="true" />
      <div className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="pip" aria-hidden="true" />
            {profile.available}
          </p>
          <h1 className="hero-h1">{profile.heroLine}</h1>
          <p className="hero-sub">{profile.heroSub}</p>
          <div className="hero-actions">
            <a className="btn btn-primary" href={profile.cta.href}>
              {profile.cta.label}
            </a>
            <a className="btn btn-ghost" href="#work">
              See the work
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  useReveal();
  useScrollMotion();

  // Pause every looping animation when the tab is hidden.
  useEffect(() => {
    const on = () => document.body.classList.toggle('paused', document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);

  return (
    <div className="sq">
      <a className="skip" href="#main">
        Skip to content
      </a>
      {/* <Nav /> replaced by the portfolio-next header */}
      {/* Ciridae's system-voice strip. Sits above the header, which is why the
          header is sticky rather than fixed. */}
      <NewsBar />
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        {/* The portfolio-next hero is the new first screen. */}
        <HeroVideo />
        {/* The 3D sky hero moved down into the skills section (see #stack below).
        <ErrorBoundary fallback={<HeroFallback />}>
          <Hero />
        </ErrorBoundary>
        */}
        <About />
        {/* <Stack /> replaced by the 3D sky hero, which carries the tech skills */}
        <div id="stack">
          <ErrorBoundary fallback={<HeroFallback />}>
            <Hero />
          </ErrorBoundary>
        </div>
        <Work />
        <Film />
        <Experience />
        <Contact />
      </main>
      {/* <Footer /> replaced by the portfolio-next footer */}
      <SiteFooter />
    </div>
  );
}
