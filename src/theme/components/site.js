/** Contact and profile links, as printed on the résumé. Replace these to reuse the kit. */
export const LINKS = {
  email: "jayesh.singh431@gmail.com",
  mailto: "mailto:jayesh.singh431@gmail.com?subject=About%20a%20role",
  // Web compose when the OS has no mail app (common on Windows): mailto then
  // silently no-ops. Same address and subject as mailto.
  gmailCompose:
    "https://mail.google.com/mail/?view=cm&fs=1&to=jayesh.singh431%40gmail.com&su=About%20a%20role",
  linkedin: "https://www.linkedin.com/in/singhkjayesh/",
  github: "https://github.com/Jayesh049",
  resume: "Resume.pdf",
};

/**
 * Open the system mail client. If the OS has no handler (mailto does nothing),
 * fall back to Gmail compose in a new tab so "Email me" always does something.
 */
export function openEmail(links = LINKS) {
  const mailto = links.mailto || `mailto:${links.email}`;
  const web =
    links.gmailCompose ||
    `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(links.email)}`;

  const start = Date.now();
  const stillHere = () => document.hasFocus() && Date.now() - start < 1800;

  window.location.href = mailto;
  window.setTimeout(() => {
    if (!stillHere()) return;
    window.open(web, "_blank", "noopener,noreferrer");
  }, 650);
}

/**
 * Prefix a file in public/ with Vite's base path: "/" locally, "/portfolio/"
 * when the Pages build sets `base`.
 */
export const asset = (path) => `${import.meta.env.BASE_URL}${String(path).replace(/^\//, "")}`;
