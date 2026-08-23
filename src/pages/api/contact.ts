import type { APIRoute } from 'astro';
import { ZodError } from 'zod';
import {
  ContactMessageSchema,
  type ContactApiResponse
} from '../../lib/contact/schema';
import { storeContactMessage } from '../../lib/server/mongodb';
import { sendContactNotification } from '../../lib/server/brevo';
import { getContactEnvironmentStatus } from '../../lib/server/env';

export const prerender = false;

const FALLBACK_MESSAGE =
  'Unable to send your message right now. Please contact me directly via email.';

function json(body: ContactApiResponse, status: number, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
      ...extraHeaders
    }
  });
}

function logChannelFailure(channel: 'database' | 'email', requestId: string, reason: unknown) {
  const error = reason instanceof Error ? reason : new Error('Unknown delivery failure');
  console.error('[contact] delivery channel failed', {
    requestId,
    channel,
    errorName: error.name,
    errorMessage: error.message
  });
}

async function readRequestBody(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get('content-length') || '0');
  if (contentLength > 16_000) throw new Error('REQUEST_TOO_LARGE');

  const contentType = request.headers.get('content-type')?.toLowerCase() || '';
  if (contentType.includes('application/json')) return request.json();

  // Progressive enhancement: a native form POST still uses the request body,
  // never URL/query parameters.
  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    return Object.fromEntries(await request.formData());
  }

  throw new Error('UNSUPPORTED_CONTENT_TYPE');
}

export const POST: APIRoute = async ({ request }) => {
  const requestId = crypto.randomUUID();

  try {
    const rawBody = await readRequestBody(request);
    const message = ContactMessageSchema.parse(rawBody);

    const [databaseResult, emailResult] = await Promise.allSettled([
      storeContactMessage(message, requestId),
      sendContactNotification(message, requestId)
    ]);

    const databaseOk = databaseResult.status === 'fulfilled';
    const emailOk = emailResult.status === 'fulfilled';

    if (databaseResult.status === 'rejected') {
      logChannelFailure('database', requestId, databaseResult.reason);
    }
    if (emailResult.status === 'rejected') {
      logChannelFailure('email', requestId, emailResult.reason);
    }

    const channels = {
      database: { ok: databaseOk },
      email: { ok: emailOk }
    };

    if (!databaseOk && !emailOk) {
      console.error('[contact] all delivery channels failed', {
        requestId,
        configuration: getContactEnvironmentStatus()
      });
      return json(
        {
          ok: false,
          code: 'DELIVERY_UNAVAILABLE',
          requestId,
          channels,
          message: FALLBACK_MESSAGE
        },
        503
      );
    }

    const status = databaseOk && emailOk ? 'delivered' : 'partial';
    if (status === 'partial') {
      console.warn('[contact] message accepted with partial delivery', {
        requestId,
        databaseOk,
        emailOk
      });
    } else {
      console.info('[contact] message delivered', { requestId });
    }

    return json(
      {
        ok: true,
        status,
        requestId,
        channels,
        message: 'Message received. I’ll reply as soon as possible.'
      },
      200
    );
  } catch (error) {
    if (error instanceof ZodError) {
      console.warn('[contact] validation rejected', { requestId });
      return json(
        {
          ok: false,
          code: 'VALIDATION_ERROR',
          requestId,
          message: 'Please review the highlighted fields and try again.',
          fieldErrors: error.flatten().fieldErrors
        },
        422
      );
    }

    console.warn('[contact] invalid request', {
      requestId,
      reason: error instanceof Error ? error.message : 'unknown'
    });
    return json(
      {
        ok: false,
        code: 'INVALID_REQUEST',
        requestId,
        message: 'The request could not be processed. Please try again.'
      },
      400
    );
  }
};

export const GET: APIRoute = async () =>
  json(
    {
      ok: false,
      code: 'INVALID_REQUEST',
      requestId: crypto.randomUUID(),
      message: 'Method not allowed.'
    },
    405,
    { allow: 'POST' }
  );
