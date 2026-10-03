import { asset, LINKS, openEmail } from "./site.js";

/**
 * Footer: one metadata line and a sparse row of links on a graphite hairline.
 * Port of portfolio-next/components/SiteFooter.tsx.
 */
export default function SiteFooter({
  meta = "Jayesh Kumar Singh · Full-Stack AI Engineer · B.Tech IT, CGPA 8.6",
  links = LINKS,
}) {
  return (
    <footer className="sq-footer">
      <div className="sq-footer__row" data-reveal>
        <p className="sq-label">{meta}</p>
        <ul className="sq-footer__links">
          <li>
            <a
              className="sq-nav-link"
              href={links.mailto}
              onClick={(e) => {
                e.preventDefault();
                openEmail(links);
              }}
            >
              {links.email}
            </a>
          </li>
          <li>
            <a className="sq-nav-link" href={links.linkedin}>
              LinkedIn
            </a>
          </li>
          <li>
            <a className="sq-nav-link" href={links.github}>
              GitHub
            </a>
          </li>
          <li>
            <a className="sq-nav-link" href={asset(links.resume)}>
              Résumé
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
