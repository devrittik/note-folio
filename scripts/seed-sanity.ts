import 'dotenv/config';
import { createReadStream, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@sanity/client';
import { journals, projects, settings } from '../src/lib/data/local';
import { calculateReadTime } from '../src/lib/content/readTime';

const projectId = process.env.SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || 'production';
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId || !token) {
  throw new Error('SANITY_PROJECT_ID and SANITY_WRITE_TOKEN are required to seed content.');
}

const client = createClient({ projectId, dataset, token, apiVersion: '2026-08-22', useCdn: false });
const key = (prefix: string, index: number) => `${prefix}-${index + 1}`;

async function buildSettingsDocument(): Promise<Record<string, unknown> & { _id: string; _type: string }> {
  const document: Record<string, unknown> & { _id: string; _type: string } = {
    _id: 'siteSettings',
    _type: 'siteSettings',
    ...settings,
    skillGroups: settings.skillGroups.map((item, index) => ({ ...item, _type: 'skillGroup', _key: key('skill', index) })),
    education: settings.education.map((item, index) => ({ ...item, _type: 'education', _key: key('education', index) })),
    certifications: settings.certifications.map((item, index) => ({ ...item, _type: 'certification', _key: key('certification', index) }))
  };

  delete document.resumeUrl;
  delete document.profileImageUrl;

  const portraitPath = resolve('public/portrait-placeholder.jpg');
  if (existsSync(portraitPath)) {
    const asset = await client.assets.upload('image', createReadStream(portraitPath), {
      filename: 'profile-portrait.jpg',
      contentType: 'image/jpeg'
    });
    document.profileImage = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
  }

  const resumePath = resolve('public/resume.pdf');
  if (existsSync(resumePath)) {
    const asset = await client.assets.upload('file', createReadStream(resumePath), {
      filename: 'resume.pdf',
      contentType: 'application/pdf'
    });
    document.resumeFile = { _type: 'file', asset: { _type: 'reference', _ref: asset._id } };
  }

  const ogPath = resolve('public/og-default.png');
  if (existsSync(ogPath)) {
    const asset = await client.assets.upload('image', createReadStream(ogPath), {
      filename: 'og-default.png', contentType: 'image/png'
    });
    document.defaultSeoImage = {
      _type: 'image', asset: { _type: 'reference', _ref: asset._id }, alt: `${settings.name} portfolio preview`
    };
  }

  const faviconPath = resolve('public/favicon.png');
  if (existsSync(faviconPath)) {
    const asset = await client.assets.upload('image', createReadStream(faviconPath), {
      filename: 'favicon.png', contentType: 'image/png'
    });
    document.favicon = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
  }

  return document;
}

const transaction = client.transaction();
transaction.createOrReplace(await buildSettingsDocument());

projects.forEach((project, index) => {
  transaction.createOrReplace({
    _id: `project-${project.slug}`,
    _type: 'project',
    ...project,
    order: index + 1,
    slug: { _type: 'slug', current: project.slug },
    system: project.system.map((item, itemIndex) => ({ ...item, _type: 'object', _key: key('system', itemIndex) })),
    notes: project.notes.map((item, itemIndex) => ({ ...item, _type: 'object', _key: key('note', itemIndex) }))
  });
});

journals.forEach((entry) => {
  const body = entry.body
    .filter((item) => item.type === 'paragraph')
    .map((item, index) => ({
      _type: 'journalTextBlock',
      _key: key('body', index),
      text: item.type === 'paragraph' ? item.text : ''
    }));

  transaction.createOrReplace({
    _id: `journal-${entry.slug}`,
    _type: 'journalEntry',
    ...entry,
    readTime: calculateReadTime(body),
    schemaType: 'Article',
    body,
    slug: { _type: 'slug', current: entry.slug }
  });
});

const result = await transaction.commit();
console.log(`Seeded ${result.results.length} Sanity documents into ${projectId}/${dataset}.`);
