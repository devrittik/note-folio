import type { DataSource } from '../source';
import { journals, projects, settings } from '../local';

export const localDataSource: DataSource = {
  async getProjects() {
    return projects;
  },
  async getProjectBySlug(slug) {
    return projects.find((project) => project.slug === slug);
  },
  async getJournalEntries() {
    return journals;
  },
  async getJournalBySlug(slug) {
    return journals.find((entry) => entry.slug === slug);
  },
  async getSiteSettings() {
    return settings;
  }
};
