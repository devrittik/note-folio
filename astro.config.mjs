import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

const site = process.env.SITE_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321');

export default defineConfig({
  integrations: [react()],
  output: 'server',
  adapter: vercel(),
  site,
  vite: {
    server: {
      host: true,
      allowedHosts: ['.ngrok-free.dev', '.ngrok.io', '.e2b.app']
    }
  }
});
