import type { Journal, Project, SiteSettings } from './types';

export interface DataSource {
  getProjects(): Promise<Project[]>;
  getProjectBySlug(slug: string): Promise<Project | undefined>;
  getJournalEntries(): Promise<Journal[]>;
  getJournalBySlug(slug: string): Promise<Journal | undefined>;
  getSiteSettings(): Promise<SiteSettings>;
}
