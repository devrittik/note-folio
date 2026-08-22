import type { ContactMessage } from '../contact/schema';
import { readServerEnv } from './env';

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

export async function sendContactNotification(message: ContactMessage, requestId: string): Promise<void> {
  const apiKey = readServerEnv('BREVO_API_KEY');
  const adminEmail = readServerEnv('LEAD_NOTIFY_EMAIL') || readServerEnv('ADMIN_EMAIL');
  const senderEmail = readServerEnv('BREVO_SENDER_EMAIL') || adminEmail;
  const senderName = readServerEnv('BREVO_SENDER_NAME') || 'Engineering Notebook';

  if (!apiKey) throw new Error('BREVO_API_KEY is not configured');
  if (!adminEmail) throw new Error('LEAD_NOTIFY_EMAIL is not configured');
  if (!senderEmail) throw new Error('BREVO_SENDER_EMAIL is not configured');

  const textContent = [
    'New portfolio contact message',
    `Request ID: ${requestId}`,
    `From: ${message.name} <${message.email}>`,
    `Subject: ${message.subject}`,
    '',
    message.message
  ].join('\n');

  const response = await fetch(BREVO_ENDPOINT, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: adminEmail }],
      replyTo: { name: message.name, email: message.email },
      subject: `Portfolio message: ${message.subject}`,
      textContent,
      tags: ['portfolio-contact']
    }),
    signal: AbortSignal.timeout(10_000)
  });

  if (!response.ok) {
    throw new Error(`Brevo request failed with status ${response.status}`);
  }
}
