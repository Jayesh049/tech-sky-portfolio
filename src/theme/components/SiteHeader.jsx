import { useEffect, useRef } from "react";
import { asset, LINKS, openEmail } from "./site.js";

/**
 * Top navigation bar: name left, three links centre, cream pill right.
 * Port of portfolio-next/components/SiteHeader.tsx.
 *
 * Transparent over the hero, void black once the hero has scrolled under the
 * bar. One IntersectionObserver writes a data attribute; no scroll listener.
 */
export default function SiteHeader({ name = "Jayesh Kumar Singh", links = LINKS, heroId = "hero" }) {
  const header = useRef(null);

  useEffect(() => {
    const el = header.current;
    if (!el) return undefined;
    const hero = document.getElementById(heroId);
    if (!hero) {
      el.dataset.solid = "true";
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) el.dataset.solid = String(!entry.isIntersecting);
      },
      { rootMargin: `-${el.offsetHeight}px 0px 0px 0px` },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [heroId]);

  return (
    <header ref={header} data-solid="false" className="sq-header">
      <div className="sq-header__row" data-reveal>
        <a className="sq-nav-link sq-header__brand" href={import.meta.env.BASE_URL}>
          {name}
        </a>
        <nav aria-label="Profiles" className="sq-header__nav">
          <a className="sq-nav-link" href={links.linkedin}>
            LinkedIn
          </a>
          <a className="sq-nav-link" href={links.github}>
            GitHub
          </a>
          <a className="sq-nav-link" href={asset(links.resume)}>
            Résumé
          </a>
        </nav>
        <a
          className="sq-btn-primary sq-header__cta"
          href={links.mailto}
          onClick={(e) => {
            e.preventDefault();
            openEmail(links);
          }}
        >
          Email me
        </a>
      </div>
    </header>
  );
}
