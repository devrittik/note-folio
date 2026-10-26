import 'dotenv/config';
import { createClient, type SanityClient } from '@sanity/client';
import { getCliClient } from 'sanity/cli';
import { projectBodyFromStored } from '../src/lib/content/legacyBody';
import { calculateReadTime } from '../src/lib/content/readTime';

const API_VERSION = '2026-08-22';
const projectId = process.env.SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || 'production';
const token = process.env.SANITY_WRITE_TOKEN;
const dryRun = process.argv.includes('--dry-run');

if (!projectId) {
  throw new Error('SANITY_PROJECT_ID is required. Set it in .env before running the migration.');
}

const client: SanityClient = token
  ? createClient({ projectId, dataset, token, apiVersion: API_VERSION, useCdn: false, perspective: 'raw' })
  : getCliClient({ apiVersion: API_VERSION }).withConfig({ useCdn: false, perspective: 'raw' }) as unknown as SanityClient;

type JournalDocument = {
  _id: string;
  body?: unknown;
  figures?: unknown;
  readTime?: number;
  schemaType?: string;
};

type ProjectDocument = {
  _id: string;
  body?: unknown;
  problem?: string;
  system?: Array<{ title?: string; sub?: string }>;
  buildFeatures?: string[];
  notes?: Array<{ challenge?: string; decision?: string; tradeoff?: string }>;
  metrics?: string[];
};

function paragraphText(item: unknown): string {
  if (typeof item === 'string') return item.trim();
  if (!item || typeof item !== 'object' || Array.isArray(item)) return '';
  const record = item as Record<string, unknown>;
  if (record._type === 'image' || record.type === 'image') return '';
  return typeof record.text === 'string' ? record.text.trim() : '';
}

function figureFromBlock(item: unknown, index: number): Record<string, unknown> | undefined {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return undefined;
  const record = item as Record<string, unknown>;
  if (record._type !== 'image') return undefined;
  const key = typeof record._key === 'string' && record._key ? record._key : `figure-${index + 1}`;
  return { ...record, _key: key, _type: 'image' };
}

function journalPatch(entry: JournalDocument): Record<string, unknown> | undefined {
  const hasFigures = Array.isArray(entry.figures);
  if (typeof entry.body === 'string') {
    const readTime = calculateReadTime(entry.body);
    const metadataChanged = entry.readTime !== readTime || entry.schemaType !== 'Article' || !hasFigures;
    if (!metadataChanged) return undefined;
    return {
      ...(hasFigures ? {} : { figures: [] }),
      readTime,
      schemaType: 'Article'
    };
  }

  const blocks = Array.isArray(entry.body) ? entry.body : [];
  const paragraphs = blocks.map(paragraphText).filter(Boolean);
  const body = paragraphs.join('\n\n');
  const figures = hasFigures
    ? entry.figures
    : blocks.flatMap((item, index) => {
        const figure = figureFromBlock(item, index);
        return figure ? [figure] : [];
      });

  return {
    body,
    figures,
    readTime: calculateReadTime(body),
    schemaType: 'Article'
  };
}

const LEGACY_PROJECT_FIELDS = ['problem', 'system', 'buildFeatures', 'notes', 'metrics'] as const;

function projectPatch(project: ProjectDocument): { set?: Record<string, unknown>; unset?: string[] } | undefined {
  const unset = LEGACY_PROJECT_FIELDS.filter((field) => project[field] != null);
  const hasMarkdown = typeof project.body === 'string' && project.body.trim().length > 0;
  if (hasMarkdown) return unset.length > 0 ? { unset: [...unset] } : undefined;

  const body = projectBodyFromStored(project);
  if (!body && unset.length === 0) return undefined;
  return {
    set: { body },
    unset: unset.length > 0 ? [...unset] : undefined
  };
}

const [journals, projects] = await Promise.all([
  client.fetch<JournalDocument[]>(`*[_type == "journalEntry"]{_id, body, figures, readTime, schemaType}`),
  client.fetch<ProjectDocument[]>(`*[_type == "project"]{_id, body, problem, system, buildFeatures, notes, metrics}`)
]);

let transaction = client.transaction();
const changedIds: string[] = [];

for (const entry of journals) {
  const next = journalPatch(entry);
  if (!next) continue;
  transaction = transaction.patch(entry._id, (patch) => patch.set(next));
  changedIds.push(entry._id);
}

for (const project of projects) {
  const next = projectPatch(project);
  if (!next) continue;
  transaction = transaction.patch(project._id, (patch) => {
    let nextPatch = patch;
    if (next.set) nextPatch = nextPatch.set(next.set);
    if (next.unset) nextPatch = nextPatch.unset(next.unset);
    return nextPatch;
  });
  changedIds.push(project._id);
}

if (dryRun) {
  console.log(`Dry run: ${changedIds.length} document${changedIds.length === 1 ? '' : 's'} require migration. No writes were made.`);
} else if (changedIds.length > 0) {
  await transaction.commit();
  console.log(`Migrated ${changedIds.length} document${changedIds.length === 1 ? '' : 's'}.`);
} else {
  console.log('No documents required migration.');
}

changedIds.forEach((id) => console.log(`- ${id}`));
