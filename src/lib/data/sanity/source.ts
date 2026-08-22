import { calculateReadTime } from '../../content/readTime';
import type { DataSource } from '../source';
import {
  JournalSchema,
  ProjectSchema,
  SiteSettingsSchema,
  type Journal,
  type Project,
  type SiteSettings
} from '../types';
import { getSanityClient } from './client';

const PROJECT_FIELDS = `
  "slug": slug.current,
  title,
  status,
  year,
  order,
  oneLiner,
  screenshots[]{"url": asset->url, alt, caption},
  techStack,
  problem,
  system[]{title, sub},
  buildFeatures,
  notes[]{challenge, decision, tradeoff},
  metrics,
  liveUrl,
  githubUrl
`;

const JOURNAL_FIELDS = `
  "slug": slug.current,
  title,
  date,
  readTime,
  excerpt,
  tags,
  featured,
  body[]{
    _type == "journalTextBlock" => {"type": "paragraph", text},
    _type == "image" => {"type": "image", "url": asset->url, alt, caption}
  },
  schemaType
`;

const SETTINGS_FIELDS = `
  name,
  role,
  location,
  email,
  github,
  linkedin,
  whatsappNumber,
  whatsappDisplay,
  whatsappMessage,
  availability,
  "profileImageUrl": profileImage.asset->url,
  heroHeadline,
  heroDescription,
  coreFocus,
  homeCtaLabel,
  homeCtaButtonLabel,
  intellectualApproach,
  workTitle,
  workIntro,
  journalTitle,
  journalIntro,
  skillGroups[]{label, items},
  aboutTitle,
  aboutHeadline,
  aboutIntro,
  education[]{period, institution, qualification, detail},
  certifications[]{name, issuer, defined(url) => {url}},
  contactTitle,
  contactHeadline,
  contactIntro,
  responseTime,
  timezone,
  "resumeUrl": coalesce(resumeFile.asset->url, resumeUrl),
  footerCopyright
`;

function normalizeProject(row: Record<string, any>) {
  return {
    ...row,
    screenshots: Array.isArray(row.screenshots)
      ? row.screenshots
          .filter((screenshot: Record<string, unknown>) => typeof screenshot.url === 'string')
          .map((screenshot: Record<string, unknown>) => ({
            ...screenshot,
            caption: screenshot.caption ?? undefined
          }))
      : []
  };
}

function normalizeJournal(row: Record<string, any>) {
  const body = Array.isArray(row.body)
    ? row.body
        .filter((item: unknown) => Boolean(item))
        .map((item: Record<string, unknown>) => ({
          ...item,
          caption: item.caption ?? undefined
        }))
    : [];

  return {
    ...row,
    body,
    readTime: calculateReadTime(body),
    schemaType: row.schemaType ?? 'Article'
  };
}

async function fetchProjects(): Promise<Project[]> {
  const rows = await getSanityClient().fetch(
    `*[_type == "project"] | order(order asc, year desc) {${PROJECT_FIELDS}}`
  );
  return ProjectSchema.array().parse(rows.map(normalizeProject));
}

async function fetchProjectBySlug(slug: string): Promise<Project | undefined> {
  const row = await getSanityClient().fetch(
    `*[_type == "project" && slug.current == $slug][0] {${PROJECT_FIELDS}}`,
    { slug }
  );
  return row ? ProjectSchema.parse(normalizeProject(row)) : undefined;
}

async function fetchJournalEntries(): Promise<Journal[]> {
  const rows = await getSanityClient().fetch(
    `*[_type == "journalEntry"] | order(date desc) {${JOURNAL_FIELDS}}`
  );
  return JournalSchema.array().parse(rows.map(normalizeJournal));
}

async function fetchJournalBySlug(slug: string): Promise<Journal | undefined> {
  const row = await getSanityClient().fetch(
    `*[_type == "journalEntry" && slug.current == $slug][0] {${JOURNAL_FIELDS}}`,
    { slug }
  );
  return row ? JournalSchema.parse(normalizeJournal(row)) : undefined;
}

async function fetchSiteSettings(): Promise<SiteSettings> {
  const row = await getSanityClient().fetch(
    `*[_type == "siteSettings"][0] {${SETTINGS_FIELDS}}`
  );
  if (!row) throw new Error('Sanity has no published siteSettings document');

  // Sanity returns `null` for projected optional fields. Normalize those values
  // to `undefined` before Zod parsing so intentionally blank CMS fields remain
  // optional throughout the application data layer.
  const normalized = {
    ...row,
    profileImageUrl: row.profileImageUrl ?? undefined,
    resumeUrl: row.resumeUrl ?? undefined,
    education: Array.isArray(row.education)
      ? row.education.map((record: Record<string, unknown>) => ({
          ...record,
          detail: record.detail ?? undefined
        }))
      : row.education,
    certifications: Array.isArray(row.certifications)
      ? row.certifications.map((certificate: Record<string, unknown>) => ({
          ...certificate,
          url: certificate.url ?? undefined
        }))
      : row.certifications
  };

  return SiteSettingsSchema.parse(normalized);
}

export const sanityDataSource: DataSource = {
  getProjects: fetchProjects,
  getProjectBySlug: fetchProjectBySlug,
  getJournalEntries: fetchJournalEntries,
  getJournalBySlug: fetchJournalBySlug,
  getSiteSettings: fetchSiteSettings
};
