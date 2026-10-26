import { journalContentFromStored, normalizeCarouselImages, projectBodyFromStored } from '../../content/legacyBody';
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

const CAROUSEL_IMAGE = `{"url": asset->url, alt, caption, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height}`;

const PROJECT_FIELDS = `
  "slug": slug.current,
  title,
  status,
  year,
  "updatedAt": _updatedAt,
  order,
  oneLiner,
  screenshots[]${CAROUSEL_IMAGE},
  techStack,
  body,
  problem,
  system[]{title, sub},
  buildFeatures,
  notes[]{challenge, decision, tradeoff},
  metrics,
  liveUrl,
  githubUrl,
  seoTitle,
  seoDescription,
  "seoImageUrl": seoImage.asset->url,
  "seoImageAlt": seoImage.alt,
  "seoImageWidth": seoImage.asset->metadata.dimensions.width,
  "seoImageHeight": seoImage.asset->metadata.dimensions.height
`;

const JOURNAL_FIELDS = `
  "slug": slug.current,
  title,
  date,
  "updatedAt": _updatedAt,
  readTime,
  excerpt,
  tags,
  featured,
  figures[]${CAROUSEL_IMAGE},
  body,
  "legacyBlocks": body[]{
    _type == "journalTextBlock" => {"type": "paragraph", text},
    _type == "image" => {"type": "image", "url": asset->url, alt, caption, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height}
  },
  schemaType,
  seoTitle,
  seoDescription,
  "seoImageUrl": seoImage.asset->url,
  "seoImageAlt": seoImage.alt,
  "seoImageWidth": seoImage.asset->metadata.dimensions.width,
  "seoImageHeight": seoImage.asset->metadata.dimensions.height
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
  "profileImageWidth": profileImage.asset->metadata.dimensions.width,
  "profileImageHeight": profileImage.asset->metadata.dimensions.height,
  "defaultSeoImageUrl": defaultSeoImage.asset->url,
  "defaultSeoImageAlt": defaultSeoImage.alt,
  "defaultSeoImageWidth": defaultSeoImage.asset->metadata.dimensions.width,
  "defaultSeoImageHeight": defaultSeoImage.asset->metadata.dimensions.height,
  "faviconUrl": favicon.asset->url,
  twitterHandle,
  heroHeadline,
  heroDescription,
  coreFocus,
  homeCtaLabel,
  homeCtaButtonLabel,
  favoriteQuote,
  favoriteQuoteAuthor,
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
  const { problem, system, buildFeatures, notes, metrics, ...project } = row;

  return {
    ...project,
    screenshots: normalizeCarouselImages(row.screenshots),
    body: projectBodyFromStored({ body: row.body, problem, system, buildFeatures, notes, metrics })
  };
}

function normalizeJournal(row: Record<string, any>) {
  const storedBody = typeof row.body === 'string' ? row.body : row.legacyBlocks;
  const content = journalContentFromStored(storedBody, row.figures);
  const { legacyBlocks: _legacyBlocks, ...entry } = row;

  return {
    ...entry,
    body: content.body,
    figures: content.figures,
    readTime: calculateReadTime(content.body),
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
