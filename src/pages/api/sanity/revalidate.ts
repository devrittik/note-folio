import type { APIRoute } from 'astro';
import { timingSafeEqual } from 'node:crypto';
import { clearDataCache } from '../../../lib/data';
import { readServerEnv } from '../../../lib/server/env';

export const prerender = false;
const json=(body:Record<string,unknown>,status:number)=>new Response(JSON.stringify(body),{
  status,
  headers:{'content-type':'application/json','cache-control':'no-store','x-robots-tag':'noindex, nofollow'}
});

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
    return json({ok:false},503);
  }

  const authorized =
    matchesSecret(request.headers.get('authorization'), expected) ||
    matchesSecret(request.headers.get('x-sanity-webhook-secret'), expected);
  if (!authorized) return json({ok:false},401);

  clearDataCache();
  console.info('[sanity] content cache cleared by webhook');
  return json({ok:true},200);
};
