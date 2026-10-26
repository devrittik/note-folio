import { z } from 'zod';

const optionalString = z.string().nullish().transform((value) => value ?? undefined);
const optionalUrl = z.string().url().nullish().transform((value) => value ?? undefined);
const optionalNumber = z.number().positive().nullish().transform((value) => value ?? undefined);

export const ScreenshotSchema = z.object({
  url: z.string().url(),
  alt: z.string(),
  caption: optionalString,
  width: optionalNumber,
  height: optionalNumber
});
export type Screenshot = z.infer<typeof ScreenshotSchema>;

export const ProjectSchema = z.object({
  slug: z.string(),
  title: z.string(),
  status: z.enum(['live', 'built']),
  year: z.number(),
  updatedAt: optionalString,
  order: z.number().default(0),
  oneLiner: z.string(),
  screenshots: z.array(ScreenshotSchema).default([]),
  techStack: z.array(z.string()),
  body: z.string().default(''),
  liveUrl: optionalUrl,
  githubUrl: optionalUrl,
  seoTitle: optionalString,
  seoDescription: optionalString,
  seoImageUrl: optionalUrl,
  seoImageAlt: optionalString,
  seoImageWidth: optionalNumber,
  seoImageHeight: optionalNumber
});
export type Project = z.infer<typeof ProjectSchema>;

export const JournalSchema = z.object({
  slug: z.string(),
  title: z.string(),
  date: z.string(),
  updatedAt: optionalString,
  readTime: z.number(),
  excerpt: z.string(),
  tags: z.array(z.string()),
  featured: z.boolean().default(false),
  figures: z.array(ScreenshotSchema).default([]),
  body: z.string().default(''),
  schemaType: z.preprocess((value) => value ?? 'Article', z.literal('Article')),
  seoTitle: optionalString,
  seoDescription: optionalString,
  seoImageUrl: optionalUrl,
  seoImageAlt: optionalString,
  seoImageWidth: optionalNumber,
  seoImageHeight: optionalNumber
});
export type Journal = z.infer<typeof JournalSchema>;

export const CertificationSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  url: optionalUrl
});
export type Certification = z.infer<typeof CertificationSchema>;

export const EducationSchema = z.object({
  period: z.string(),
  institution: z.string(),
  qualification: z.string(),
  detail: optionalString
});
export type Education = z.infer<typeof EducationSchema>;

export const SkillGroupSchema = z.object({
  label: z.string(),
  items: z.array(z.string())
});
export type SkillGroup = z.infer<typeof SkillGroupSchema>;

export const SiteSettingsSchema = z.object({
  name: z.string(),
  role: z.string(),
  location: z.string(),
  email: z.string().email(),
  github: z.string(),
  linkedin: z.string(),
  whatsappNumber: z.string(),
  whatsappDisplay: z.string(),
  whatsappMessage: z.string(),
  availability: z.string(),
  profileImageUrl: optionalString,
  profileImageWidth: optionalNumber,
  profileImageHeight: optionalNumber,
  defaultSeoImageUrl: optionalUrl,
  defaultSeoImageAlt: optionalString,
  defaultSeoImageWidth: optionalNumber,
  defaultSeoImageHeight: optionalNumber,
  faviconUrl: optionalUrl,
  twitterHandle: optionalString,
  heroHeadline: z.string(),
  heroDescription: z.string(),
  coreFocus: z.array(z.string()),
  homeCtaLabel: z.string(),
  homeCtaButtonLabel: z.string(),
  favoriteQuote: optionalString,
  favoriteQuoteAuthor: optionalString,
  intellectualApproach: z.string(),
  workTitle: z.string(),
  workIntro: z.string(),
  journalTitle: z.string(),
  journalIntro: z.string(),
  skillGroups: z.array(SkillGroupSchema),
  aboutTitle: z.string(),
  aboutHeadline: z.string(),
  aboutIntro: z.string(),
  education: z.array(EducationSchema),
  certifications: z.array(CertificationSchema),
  contactTitle: z.string(),
  contactHeadline: z.string(),
  contactIntro: z.string(),
  responseTime: z.string(),
  timezone: z.string(),
  resumeUrl: optionalString,
  footerCopyright: z.string()
});
export type SiteSettings = z.infer<typeof SiteSettingsSchema>;
