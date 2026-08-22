import 'dotenv/config';
import { createClient, type SanityClient } from '@sanity/client';
import { getCliClient } from 'sanity/cli';
import { calculateReadTime } from '../src/lib/content/readTime';

const API_VERSION = '2026-08-22';
const projectId = process.env.SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || 'production';
const token = process.env.SANITY_WRITE_TOKEN;
const dryRun = process.argv.includes('--dry-run');

if (!projectId) {
  throw new Error('SANITY_PROJECT_ID is required. Set it in .env before running the migration.');
}

// Prefer an explicit server-side token for CI. When it is absent, use the
// authenticated Sanity CLI session from `sanity login` / `sanity dev`.
const client: SanityClient = token
  ? createClient({ projectId: projectId!, dataset, token, apiVersion: API_VERSION, useCdn: false, perspective: 'raw' })
  : getCliClient({ apiVersion: API_VERSION }).withConfig({ useCdn: false, perspective: 'raw' }) as unknown as SanityClient;

type JournalDocument = {
  _id: string;
  body?: unknown[];
  readTime?: number;
  schemaType?: string;
};

const entries = await client.fetch<JournalDocument[]>(
  `*[_type == "journalEntry"]{_id, body, readTime, schemaType}`
);

let transaction = client.transaction();
let changed = 0;
const changedIds: string[] = [];

for (const entry of entries) {
  const originalBody = Array.isArray(entry.body) ? entry.body : [];
  let bodyChanged = !Array.isArray(entry.body);

  const body = originalBody.flatMap((item, index) => {
    const fallbackKey = `migrated-${index + 1}`;

    if (typeof item === 'string') {
      bodyChanged = true;
      return [{ _type: 'journalTextBlock', _key: fallbackKey, text: item }];
    }

    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      bodyChanged = true;
      return [];
    }

    const object = item as Record<string, unknown>;
    if (typeof object._key !== 'string' || !object._key) {
      bodyChanged = true;
      return [{ ...object, _key: fallbackKey }];
    }

    return [object];
  });

  const readTime = calculateReadTime(body);
  const metadataChanged = entry.readTime !== readTime || entry.schemaType !== 'Article';
  if (!bodyChanged && !metadataChanged) continue;

  transaction = transaction.patch(entry._id, (patch) =>
    patch.set({ body, readTime, schemaType: 'Article' })
  );
  changed += 1;
  changedIds.push(entry._id);
}

if (dryRun) {
  console.log(`Dry run: ${changed} journal document${changed === 1 ? '' : 's'} require migration. No writes were made.`);
  changedIds.forEach((id) => console.log(`- ${id}`));
} else {
  if (changed > 0) await transaction.commit();
  console.log(`Migrated ${changed} journal document${changed === 1 ? '' : 's'}.`);
  changedIds.forEach((id) => console.log(`- ${id}`));
}
