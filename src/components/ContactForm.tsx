import { useRef, useState, type SubmitEvent } from 'react';
import type { ContactApiResponse } from '../lib/contact/schema';

type FieldErrors = Record<string, string[] | undefined>;
type SubmissionState =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'success'; message: string; partial: boolean }
  | { kind: 'validation'; message: string; fields: FieldErrors }
  | { kind: 'unavailable'; message: string }
  | { kind: 'network'; message: string };

interface Props {
  directEmail: string;
}

const NETWORK_MESSAGE =
  'The connection was interrupted. Please check your network and try again.';

export default function ContactForm({ directEmail }: Props) {
  const [state, setState] = useState<SubmissionState>({ kind: 'idle' });
  const submissionInProgress = useRef(false);

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submissionInProgress.current) return;

    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    submissionInProgress.current = true;
    setState({ kind: 'sending' });

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      subject: String(formData.get('subject') || ''),
      message: String(formData.get('message') || '').trim()
    };

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload),
        credentials: 'same-origin',
        signal: controller.signal
      });

      const result = (await response.json()) as ContactApiResponse;

      if (response.ok && result.ok) {
        form.reset();
        setState({
          kind: 'success',
          message: result.message,
          partial: result.status === 'partial'
        });
        return;
      }

      if (!result.ok && result.code === 'VALIDATION_ERROR') {
        setState({
          kind: 'validation',
          message: result.message,
          fields: result.fieldErrors || {}
        });
        return;
      }

      if (!result.ok && result.code === 'DELIVERY_UNAVAILABLE') {
        setState({ kind: 'unavailable', message: result.message });
        return;
      }

      setState({
        kind: 'network',
        message: !result.ok ? result.message : NETWORK_MESSAGE
      });
    } catch {
      setState({ kind: 'network', message: NETWORK_MESSAGE });
    } finally {
      window.clearTimeout(timeout);
      submissionInProgress.current = false;
    }
  };

  const fieldError = (name: string) =>
    state.kind === 'validation' ? state.fields[name]?.[0] : undefined;

  const isSending = state.kind === 'sending';

  return (
    <form
      className="form-wrap"
      method="post"
      action="/api/contact"
      onSubmit={submit}
      aria-busy={isSending}
      noValidate={false}
    >
      <div className="form-grid">
        <div className="field">
          <label htmlFor="name">Your name *</label>
          <input
            id="name"
            name="name"
            placeholder="Enter your full name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            aria-invalid={Boolean(fieldError('name'))}
            aria-describedby={fieldError('name') ? 'name-error' : undefined}
          />
          {fieldError('name') && <small id="name-error" className="field-error">{fieldError('name')}</small>}
        </div>

        <div className="field">
          <label htmlFor="email">Email endpoint *</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="name@endpoint.com"
            autoComplete="email"
            required
            maxLength={254}
            aria-invalid={Boolean(fieldError('email'))}
            aria-describedby={fieldError('email') ? 'email-error' : undefined}
          />
          {fieldError('email') && <small id="email-error" className="field-error">{fieldError('email')}</small>}
        </div>

        <div className="field full">
          <label htmlFor="subject">Subject of inquiry *</label>
          <select
            id="subject"
            name="subject"
            required
            aria-invalid={Boolean(fieldError('subject'))}
            aria-describedby={fieldError('subject') ? 'subject-error' : undefined}
          >
            <option>Project Inquiry // Freelance Dev</option>
            <option>Full-Time Opportunity</option>
            <option>Architecture Consultation</option>
            <option>Other</option>
          </select>
          {fieldError('subject') && <small id="subject-error" className="field-error">{fieldError('subject')}</small>}
        </div>

        <div className="field full">
          <label htmlFor="message">Message record *</label>
          <textarea
            id="message"
            name="message"
            placeholder="Describe your architecture challenge or project details..."
            required
            minLength={10}
            maxLength={5000}
            aria-invalid={Boolean(fieldError('message'))}
            aria-describedby={fieldError('message') ? 'message-error' : undefined}
          />
          {fieldError('message') && <small id="message-error" className="field-error">{fieldError('message')}</small>}
        </div>
      </div>

      <button className="submit transition-mechanical" type="submit" disabled={isSending}>
        {isSending ? 'Transmitting…' : 'Transmit Message ↗'}
      </button>

      <div className="form-status" aria-live="polite" role="status">
        {state.kind === 'sending' && <span>CHANNELS OPEN // Transmitting securely…</span>}
        {state.kind === 'success' && (
          <span className="signal">
            TRANSMISSION CONFIRMED // {state.message}
            {state.partial ? ' One delivery channel is temporarily delayed.' : ''}
          </span>
        )}
        {state.kind === 'validation' && <span>{state.message}</span>}
        {state.kind === 'network' && <span>{state.message}</span>}
        {state.kind === 'unavailable' && (
          <span>
            {state.message}{' '}
            <a href={`mailto:${directEmail}`}>{directEmail}</a>
          </span>
        )}
      </div>
    </form>
  );
}
