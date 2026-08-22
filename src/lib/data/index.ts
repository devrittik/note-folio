import { readServerEnv } from '../server/env';
import { localDataSource } from './local/source';
import { isSanityConfigured } from './sanity/client';
import { sanityDataSource } from './sanity/source';
import type { DataSource } from './source';

const requestedSource = readServerEnv('DATA_SOURCE')?.toLowerCase();

function resolveDataSource(): { name: 'local' | 'sanity'; source: DataSource } {
  if (requestedSource && requestedSource !== 'local' && requestedSource !== 'sanity') {
    throw new Error('DATA_SOURCE must be either "local" or "sanity"');
  }

  if (requestedSource === 'sanity') {
    if (!isSanityConfigured()) {
      throw new Error('DATA_SOURCE=sanity requires SANITY_PROJECT_ID and SANITY_DATASET');
    }
    return { name: 'sanity', source: sanityDataSource };
  }

  if (requestedSource === 'local') return { name: 'local', source: localDataSource };
  if (isSanityConfigured()) return { name: 'sanity', source: sanityDataSource };
  return { name: 'local', source: localDataSource };
}

const selected = resolveDataSource();
const cache = new Map<string, { expires: number; value: Promise<unknown> }>();

function cacheTtl(): number {
  const configured = Number(readServerEnv('SANITY_CACHE_TTL_MS') || '30000');
  return Number.isFinite(configured) && configured >= 0 ? configured : 30_000;
}

async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  if (selected.name === 'local' || cacheTtl() === 0) return load();

  const now = Date.now();
  const existing = cache.get(key);
  if (existing && existing.expires > now) return existing.value as Promise<T>;

  const value = load().catch((error) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, { expires: now + cacheTtl(), value });
  return value;
}

export function clearDataCache() {
  cache.clear();
}

export function getDataSourceName() {
  return selected.name;
}

export const getProjects = () => cached('projects', () => selected.source.getProjects());
export const getProjectBySlug = (slug: string) =>
  cached(`project:${slug}`, () => selected.source.getProjectBySlug(slug));
export const getJournalEntries = () =>
  cached('journals', () => selected.source.getJournalEntries());
export const getJournalBySlug = (slug: string) =>
  cached(`journal:${slug}`, () => selected.source.getJournalBySlug(slug));
export const getSiteSettings = () =>
  cached('settings', () => selected.source.getSiteSettings());

export function getWhatsappHref(settings: Awaited<ReturnType<typeof getSiteSettings>>) {
  return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(settings.whatsappMessage)}`;
}
