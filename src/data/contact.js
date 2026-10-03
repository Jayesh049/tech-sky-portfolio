// WHERE THE CONTACT FORM GOES.
//
// This site is served by GitHub Pages (.github/workflows/deploy-pages.yml),
// which hosts static files and nothing else -- there is no server here to post
// a form to and no place to keep an SMTP password. So the form posts straight
// from the visitor's browser to Web3Forms, which relays it as an email.
//
// ── HOW TO GET THE KEY (about two minutes, no account) ──────────────────────
//   1. Open https://web3forms.com
//   2. Put jayesh.singh431@gmail.com into "Create your Access Key"
//   3. They email you a key shaped like
//        a1b2c3d4-1234-5678-9abc-def012345678
//   4. Replace the placeholder below with it, then rebuild.
//
// ── IS IT SAFE TO COMMIT? ───────────────────────────────────────────────────
// Yes. A Web3Forms access key is designed to be public: it sits in the page
// source of every site that uses one, because the browser is what posts. It
// can do exactly one thing -- deliver a message to the inbox it was created
// for. It is not a password, it does not sign you in, and it cannot read past
// submissions. Rotate it from the same page if it ever attracts spam.
export const WEB3FORMS_KEY = 'b9fe3f60-4ccb-4ad3-8abe-f94bdd0041ec';

/**
 * True once a real key is in place. Until then the contact section renders the
 * plain mailto link it has always had, so the page is never left with a form
 * that silently fails -- a broken form is worse than no form, because the
 * visitor believes the message was sent.
 */
export const formReady = () =>
  typeof WEB3FORMS_KEY === 'string' &&
  WEB3FORMS_KEY.length >= 30 &&
  !WEB3FORMS_KEY.startsWith('PASTE-');

export const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

// What lands in the inbox as the subject line, so these are findable later.
export const FORM_SUBJECT = 'Portfolio: someone got in touch';
