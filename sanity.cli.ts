import { defineCliConfig } from 'sanity/cli';

// These are public Sanity identifiers. Authentication tokens are intentionally
// absent and are read only by server-side scripts or the authenticated CLI.
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.SANITY_DATASET || 'production';

export default defineCliConfig({ api: { projectId: projectId || '', dataset } });
