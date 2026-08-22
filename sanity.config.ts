import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './src/lib/data/sanity/schemaTypes';

// Sanity project IDs and dataset names are public identifiers used by Studio.
// Never reference read/write tokens or other server credentials in this file,
// because Sanity Studio is a browser application.
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.SANITY_DATASET || 'production';

if (!projectId) {
  throw new Error('Set SANITY_STUDIO_PROJECT_ID (or SANITY_PROJECT_ID) before starting Sanity Studio.');
}

export default defineConfig({
  name: 'engineering-notebook',
  title: 'Engineering Notebook CMS',
  projectId,
  dataset,
  basePath: '/studio',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Site settings')
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.divider(),
            S.documentTypeListItem('project').title('Projects'),
            S.documentTypeListItem('journalEntry').title('Journal entries')
          ])
    }),
    visionTool()
  ],
  schema: { types: schemaTypes }
});
