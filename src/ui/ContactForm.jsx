import { useEffect, useRef, useState } from 'react';
import { WEB3FORMS_KEY, WEB3FORMS_ENDPOINT, FORM_SUBJECT } from '../data/contact.js';
import { profile } from '../data/profile.js';

// The contact form, opened in place of the "Start a conversation" button.
//
// It posts to Web3Forms from the visitor's browser -- see src/data/contact.js
// for why there is no server involved. Three fields and a honeypot; nothing is
// stored here and nothing is sent anywhere else.
//
// The mailto link stays available at every step, including after a failure,
// because the one thing this must never do is swallow a message someone took
// the trouble to write.

const FIELDS = [
  { name: 'name', label: 'Your name', type: 'text', autoComplete: 'name', rows: 0 },
  { name: 'email', label: 'Your email', type: 'email', autoComplete: 'email', rows: 0 },
  { name: 'message', label: 'What needs building, and what is going wrong', type: 'text', autoComplete: 'off', rows: 5 },
];

export default function ContactForm({ onClose }) {
  const [status, setStatus] = useState('idle'); // idle | sending | ok | error
  const [error, setError] = useState('');
  const firstField = useRef(null);
  const form = useRef(null);

  // Opening the form moves focus into it; without this the keyboard is left
  // back on a button that no longer exists.
  useEffect(() => {
    firstField.current?.focus();
  }, []);

  // Escape closes, the way every expanding panel on the web does -- but not
  // mid-send, where it would look like the message was cancelled.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && status !== 'sending') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, status]);

  const submit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setError('');

    const data = Object.fromEntries(new FormData(form.current).entries());
    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: FORM_SUBJECT,
          from_name: 'Portfolio contact form',
          ...data,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.success) {
        setStatus('ok');
      } else {
        // Report what the service actually said rather than a generic line:
        // "invalid access key" is something the site's owner can act on, and
        // the visitor still gets the mailto fallback either way.
        setStatus('error');
        setError(body.message || `The form service replied ${res.status}.`);
      }
    } catch {
      setStatus('error');
      setError('The message could not be sent. Your connection may be blocking it.');
    }
  };

  if (status === 'ok') {
    return (
      <div className="cf cf-done" role="status">
        <p className="cf-done-h">Sent. Thank you.</p>
        <p className="cf-done-p">
          It is in my inbox and I answer every one, usually the same day.
        </p>
        <button type="button" className="btn btn-ghost cf-btn" onClick={onClose}>
          Close
        </button>
      </div>
    );
  }

  return (
    <form className="cf" ref={form} onSubmit={submit} noValidate={false}>
      {/* Web3Forms' honeypot: real people never see it, bots fill it in, and a
          filled one is dropped before it reaches the inbox. */}
      <input type="checkbox" name="botcheck" className="cf-bot" tabIndex={-1} autoComplete="off" />

      {FIELDS.map((f, i) =>
        f.rows ? (
          <label className="cf-field" key={f.name}>
            <span className="cf-label">{f.label}</span>
            <textarea
              ref={i === 0 ? firstField : undefined}
              className="cf-input cf-area"
              name={f.name}
              rows={f.rows}
              required
              autoComplete={f.autoComplete}
              disabled={status === 'sending'}
            />
          </label>
        ) : (
          <label className="cf-field" key={f.name}>
            <span className="cf-label">{f.label}</span>
            <input
              ref={i === 0 ? firstField : undefined}
              className="cf-input"
              name={f.name}
              type={f.type}
              required
              autoComplete={f.autoComplete}
              disabled={status === 'sending'}
            />
          </label>
        )
      )}

      <div className="cf-actions">
        <button type="submit" className="btn btn-primary cf-btn" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending' : 'Send message'}
        </button>
        <button type="button" className="btn btn-ghost cf-btn" onClick={onClose} disabled={status === 'sending'}>
          Cancel
        </button>
      </div>

      {/* One live region for both states, so a screen reader announces the
          outcome without the focus having to move. */}
      <p className="cf-status" role="status" aria-live="polite" data-state={status}>
        {status === 'sending' ? 'Sending your message.' : null}
        {status === 'error' ? (
          <>
            {error}{' '}
            <a href={profile.cta.href}>Email me directly instead.</a>
          </>
        ) : null}
      </p>
    </form>
  );
}
