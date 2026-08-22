import { createClient, type SanityClient } from '@sanity/client';
import { readServerEnv } from '../../server/env';

let client: SanityClient | undefined;

export function isSanityConfigured(): boolean {
  return Boolean(readServerEnv('SANITY_PROJECT_ID') && readServerEnv('SANITY_DATASET'));
}

export function getSanityClient(): SanityClient {
  if (client) return client;

  const projectId = readServerEnv('SANITY_PROJECT_ID');
  const dataset = readServerEnv('SANITY_DATASET');
  const token = readServerEnv('SANITY_READ_TOKEN');

  if (!projectId || !dataset) {
    throw new Error('Sanity is selected but SANITY_PROJECT_ID or SANITY_DATASET is missing');
  }

  client = createClient({
    projectId,
    dataset,
    apiVersion: readServerEnv('SANITY_API_VERSION') || '2026-08-22',
    token,
    useCdn: !token && readServerEnv('SANITY_USE_CDN') !== 'false',
    perspective: 'published'
  });

  return client;
}
