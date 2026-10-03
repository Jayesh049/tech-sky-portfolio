// Only the retired CTA used this.
// import { profile } from '../../data/profile.js';

// Ciridae's system voice: an Abyss strip above everything, carrying machine
// data in 11px uppercase mono with bullet separators. It is the only place
// monospace appears outside the code panels, and the distinction is the point
// — this is status, not brand communication.
//
// Deliberately not a marquee. The reference implementation's ticker is static
// text; a scrolling strip would be the one piece of perpetual motion on a page
// whose whole motion language is "arrives once, then rests".
export default function NewsBar({
  items = [
    'Available',
    'Sep 2026',
    'Open to remote full-stack roles',
    'Noida, India',
    'UTC+5:30',
  ],
  // RETIRED. The bar is the system's voice, not a place to sell: the header
  // already carries EMAIL ME and #contact carries the real call to action. It
  // also stretched to width:100% below 900px, which put a slab across the top
  // of every phone.
  // cta = 'Start now',
}) {
  return (
    <div className="newsbar">
      <div className="newsbar__in">
        <p className="newsbar__ticker sys">
          {items.map((t, i) => (
            <span key={t}>
              {i === 0 ? <b>{t}</b> : t}
              {i < items.length - 1 ? <i aria-hidden="true">•</i> : null}
            </span>
          ))}
        </p>
        {/* <a className="newsbar__btn" href={profile.cta.href}>{cta}</a> */}
      </div>
    </div>
  );
}
