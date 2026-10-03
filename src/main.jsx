import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
// MERCURY: previous Squarespace-style theme, kept for reference
// import './pf2-variables.css';
// import './theme-mono.css';
// Mercury tokens first; the portfolio-next kit loads after them so its sq-* components
// keep their own values for token names both packs share; Mercury styling last.
// CIRIDAE: Mercury superseded, kept for reference
// import './pf2-mercury-variables.css';
import './theme/sequel-theme.css';
// import './theme-mercury.css';
// Ciridae tokens, then the skin. Loaded last so it re-points both of the
// systems above; comment out these two lines to remove Ciridae entirely.
import './ciridae-variables.css';
import './theme-ciridae.css';
// The masthead sequence and the page peel. AFTER theme-ciridae so
// `.sq-hero { min-height: 100svh }` outranks its 78svh (same specificity);
// comment out these two lines to return to the static masthead.
import './theme/hero-sequence.css';
import './theme/page-peel.css';
// The crystal slabs the sequence ends on: the scene art, bevelled glass,
// the crown, the floor portal and the world behind them. After
// hero-sequence.css so its desktop rules win. It styles markup that
// HeroPaths.jsx and HeroVideo.jsx now render, so it stays on with them.
import './theme/hero-panels.css';
// The film section's own skin, ported from the AISecurity SPECTRA site.
// Every selector is #film-prefixed, so it outranks theme-ciridae whatever
// the order and cannot reach a pixel outside the section.
import './theme/film-spectra.css';
// The deck restyled as lit glass cards fanned out in 3D, with the rock,
// rings and gold dust behind them. After film-spectra.css so it wins; the
// markup it styles (covers, tips, icons) lives in Film.jsx and FilmArt.jsx.
import './theme/film-deck.css';
// The About section's six discipline cards as gold-framed glass, with the
// heading band, stats row and ridge line above them. Styles only; the
// markup lives in Sections.jsx and the drawings in SkillArt.jsx.
import './theme/skills-cards.css';
// The skills sky: pick a technology, watch its code build a small working
// system, then the storm clears. Section styles, then the ten build scenes.
// Styles only; the markup lives in Hero.jsx and src/ui/scenes/.
import './theme/skills-storm.css';
import './theme/skills-scenes.css';

// The contact form. Last, so its field styling sits on top of the base .btn
// and form rules in index.css.
import './theme/contact-form.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
