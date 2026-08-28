// Renders a Form section whose questions the editor wrote themselves
// (sectionForm.fields). The sibling path, FormRenderer.tsx, renders a `form`
// DOCUMENT and is untouched by this file.
//
// The one rule that makes this safe to hand to a volunteer: the standard Name,
// Email, and Phone boxes ALWAYS lead. An editor can write any questions they
// like and the church still gets a reply address, which a hand-built form
// document cannot guarantee.
//
// The answers become "Question: answer" lines that are folded into a single
// `message` field. That is why nothing downstream changes: Web3Forms, the
// notification email, and the mailto fallback all still see one message.
//
// Submit resolution matches FormRenderer: Web3Forms when PUBLIC_WEB3FORMS_KEY
// is set, otherwise a mailto: draft to the church office, so a freshly-cloned
// template with no key still reaches a human. Shaping, the caps, and the
// required check live in src/lib/custom-form-fields.ts and are unit-tested.

import { useRef, useState, type FormEvent } from 'react';
import { site } from '@/data/site';
import { parseCustomFieldEntries, type CustomFormField } from '@/lib/custom-form-fields';

interface Props {
  questions: CustomFormField[];
  /** Church contact email, used as the mailto fallback and the reply target. */
  fallbackEmail?: string;
  /** Section heading, used only to name the submission in the inbox. */
  title?: string;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
const ENV_WEB3FORMS_KEY = import.meta.env.PUBLIC_WEB3FORMS_KEY as string | undefined;

const inputCls =
  'w-full px-s py-s border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]';

export default function QuestionsForm({ questions, fallbackEmail, title }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [answers, setAnswers] = useState<Record<number, string | boolean>>({});
  const [botcheck, setBotcheck] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const formRef = useRef<HTMLFormElement | null>(null);

  // Build the [name, value] pairs the shared parser expects, exactly as a native
  // form POST would produce them: a ticked box posts "Yes", an unticked one
  // posts nothing at all.
  function entries(): Array<[string, string]> {
    const out: Array<[string, string]> = [];
    questions.forEach((q, i) => {
      out.push([`custom_${i}_label`, q.label]);
      if (q.required) out.push([`custom_${i}_req`, '1']);
      const v = answers[i];
      if (q.kind === 'checkbox') {
        if (v === true) out.push([`custom_${i}`, 'Yes']);
      } else if (typeof v === 'string' && v.trim()) {
        out.push([`custom_${i}`, v]);
      }
    });
    return out;
  }

  function focusField(selector: string) {
    formRef.current?.querySelector<HTMLElement>(selector)?.focus();
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');
    // Honeypot: pretend it worked so the bot moves on, and send nothing.
    if (botcheck) {
      setStatus('success');
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      focusField('[name="name"]');
      return;
    }
    if (!/.+@.+\..+/.test(email)) {
      setErrorMsg('Please enter an email address we can reply to.');
      focusField('[name="email"]');
      return;
    }

    const parsed = parseCustomFieldEntries(entries());
    if (parsed.error) {
      setErrorMsg(parsed.error);
      focusField('[data-custom-question]');
      return;
    }
    const message = parsed.lines.join('\n');
    const subject = `${title || 'Website'} inquiry`;

    // No key configured: hand the visitor a pre-filled email instead of losing
    // the message. Same fallback FormRenderer uses.
    if (!ENV_WEB3FORMS_KEY) {
      const body = [`Name: ${name}`, `Email: ${email}`, phone ? `Phone: ${phone}` : '', message]
        .filter(Boolean)
        .join('\n');
      window.location.href = `mailto:${fallbackEmail ?? ''}?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(body)}`;
      setStatus('success');
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: ENV_WEB3FORMS_KEY,
          subject,
          from_name: `${site.name} website`,
          name,
          email,
          phone: phone || undefined,
          replyto: email,
          message,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && (json as Record<string, unknown>).success !== false) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(
          'Something went wrong sending your message. Please try again, or email us directly.',
        );
      }
    } catch {
      setStatus('error');
      setErrorMsg('Could not reach the server. Check your connection and try again.');
    }
  }

  if (status === 'success') {
    return (
      <div role="status" aria-live="polite" className="rounded-md border border-primary bg-muted p-l">
        <p className="font-display text-h4 text-foreground">
          Thank you. We will be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate aria-busy={status === 'submitting'}>
      {/* honeypot */}
      <div
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}
      >
        <label>
          Leave blank
          <input
            type="text"
            name="botcheck"
            tabIndex={-1}
            autoComplete="off"
            value={botcheck}
            onChange={(e) => setBotcheck(e.target.value)}
          />
        </label>
      </div>

      {errorMsg && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-s rounded-md border border-destructive bg-destructive/10 p-s text-sm text-foreground"
        >
          {errorMsg}
        </div>
      )}

      {/* The standard block. It always leads, so there is always a reply address. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-s">
        <div className="sm:col-span-2">
          <label htmlFor="qf-name" className="block text-sm font-semibold text-foreground mb-1">
            Name <span className="text-destructive">*</span>
          </label>
          <input
            id="qf-name"
            name="name"
            type="text"
            required
            aria-required="true"
            autoComplete="name"
            maxLength={200}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="qf-email" className="block text-sm font-semibold text-foreground mb-1">
            Email <span className="text-destructive">*</span>
          </label>
          <input
            id="qf-email"
            name="email"
            type="email"
            required
            aria-required="true"
            autoComplete="email"
            maxLength={200}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="qf-phone" className="block text-sm font-semibold text-foreground mb-1">
            Phone <span className="font-normal text-foreground/70">(optional)</span>
          </label>
          <input
            id="qf-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={60}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* The editor's questions. Native `required` plus aria-required plus a
            visible cue, so the browser, assistive tech, and the eye agree. */}
        {questions.map((q, i) => {
          const id = `qf-custom-${i}`;
          const fieldName = `custom_${i}`;
          const value = answers[i];
          const set = (v: string | boolean) => setAnswers((m) => ({ ...m, [i]: v }));
          const cue = q.required ? (
            <span className="text-destructive"> *</span>
          ) : (
            <span className="font-normal text-foreground/70"> (optional)</span>
          );

          if (q.kind === 'checkbox') {
            return (
              <div key={id} className="sm:col-span-2 flex items-start gap-s">
                <input
                  id={id}
                  name={fieldName}
                  type="checkbox"
                  data-custom-question
                  checked={value === true}
                  onChange={(e) => set(e.target.checked)}
                  required={q.required}
                  aria-required={q.required || undefined}
                  className="mt-1 h-5 w-5"
                />
                <label htmlFor={id} className="text-sm text-foreground">
                  {q.label}
                  {q.required && <span className="text-destructive"> *</span>}
                </label>
              </div>
            );
          }

          return (
            <div key={id} className="sm:col-span-2">
              <label htmlFor={id} className="block text-sm font-semibold text-foreground mb-1">
                {q.label}
                {cue}
              </label>
              {q.kind === 'textarea' ? (
                <textarea
                  id={id}
                  name={fieldName}
                  rows={4}
                  maxLength={2000}
                  data-custom-question
                  value={(value as string) || ''}
                  onChange={(e) => set(e.target.value)}
                  required={q.required}
                  aria-required={q.required || undefined}
                  className={inputCls}
                />
              ) : q.kind === 'select' ? (
                <select
                  id={id}
                  name={fieldName}
                  data-custom-question
                  value={(value as string) || ''}
                  onChange={(e) => set(e.target.value)}
                  required={q.required}
                  aria-required={q.required || undefined}
                  className={inputCls}
                >
                  <option value="">Select an option</option>
                  {q.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={id}
                  name={fieldName}
                  type={q.kind === 'email' ? 'email' : q.kind === 'phone' ? 'tel' : 'text'}
                  maxLength={2000}
                  data-custom-question
                  autoComplete={q.kind === 'email' ? 'email' : q.kind === 'phone' ? 'tel' : undefined}
                  value={(value as string) || ''}
                  onChange={(e) => set(e.target.value)}
                  required={q.required}
                  aria-required={q.required || undefined}
                  className={inputCls}
                />
              )}
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="press-tactile mt-m inline-flex items-center justify-center min-h-[44px] px-l py-s rounded-full text-xs font-semibold uppercase tracking-[0.18em] bg-primary text-primary-foreground hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'submitting' ? 'Sending…' : 'Send'}
      </button>
    </form>
  );
}
