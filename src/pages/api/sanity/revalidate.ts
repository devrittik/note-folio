import type { APIRoute } from 'astro';
import { timingSafeEqual } from 'node:crypto';
import { clearDataCache } from '../../../lib/data';
import { readServerEnv } from '../../../lib/server/env';

export const prerender = false;

function matchesSecret(received: string | null, expected: string): boolean {
  if (!received) return false;
  const provided = received.replace(/^Bearer\s+/i, '');
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export const POST: APIRoute = async ({ request }) => {
  const expected = readServerEnv('SANITY_WEBHOOK_SECRET');
  if (!expected) {
    console.error('[sanity] webhook rejected because SANITY_WEBHOOK_SECRET is missing');
    return new Response(JSON.stringify({ ok: false }), { status: 503 });
  }

  const authorized =
    matchesSecret(request.headers.get('authorization'), expected) ||
    matchesSecret(request.headers.get('x-sanity-webhook-secret'), expected);

  if (!authorized) return new Response(JSON.stringify({ ok: false }), { status: 401 });

  clearDataCache();
  console.info('[sanity] content cache cleared by webhook');
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  });
};
