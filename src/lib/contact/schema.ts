import { z } from 'zod';

const normalizeSingleLine = (value: string) =>
  value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeMessage = (value: string) =>
  value
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();

const singleLine = (label: string, min: number, max: number) =>
  z
    .string({ required_error: `${label} is required.` })
    .transform(normalizeSingleLine)
    .pipe(z.string().min(min, `${label} is too short.`).max(max, `${label} is too long.`));

export const CONTACT_SUBJECTS = [
  'Project Inquiry // Freelance Dev',
  'Full-Time Opportunity',
  'Architecture Consultation',
  'Other'
] as const;

export const ContactMessageSchema = z
  .object({
    name: singleLine('Name', 2, 100),
    email: z
      .string({ required_error: 'Email is required.' })
      .trim()
      .toLowerCase()
      .email('Enter a valid email address.')
      .max(254, 'Email is too long.'),
    subject: z.enum(CONTACT_SUBJECTS, { errorMap: () => ({ message: 'Select a valid subject.' }) }),
    message: z
      .string({ required_error: 'Message is required.' })
      .transform(normalizeMessage)
      .pipe(z.string().min(10, 'Message must contain at least 10 characters.').max(5000, 'Message must not exceed 5,000 characters.'))
  })
  .strict();

export type ContactMessage = z.infer<typeof ContactMessageSchema>;

export type ContactApiResponse =
  | {
      ok: true;
      status: 'delivered' | 'partial';
      requestId: string;
      channels: { database: { ok: boolean }; email: { ok: boolean } };
      message: string;
    }
  | {
      ok: false;
      code: 'VALIDATION_ERROR' | 'INVALID_REQUEST' | 'DELIVERY_UNAVAILABLE';
      requestId: string;
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
      channels?: { database: { ok: boolean }; email: { ok: boolean } };
    };
