import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

const configuredSite = process.env.SITE_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321');
const site = configuredSite.replace(/\/$/, '');

export default defineConfig({
  integrations: [
    react(),
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname;
        return !(
          path === '/404' ||
          path.startsWith('/api/') ||
          path.startsWith('/studio') ||
          path.startsWith('/_') ||
          path === '/robots.txt' ||
          path.endsWith('.xml')
        );
      },
      serialize: (item) => {
        const url=new URL(item.url);
        return {...item,url:url.pathname==='/'?`${site}/`:item.url.replace(/\/$/,'')};
      },
      customSitemaps: [`${site}/content-sitemap.xml`]
    })
  ],
  output: 'server',
  trailingSlash: 'never',
  adapter: vercel({
    webAnalytics: { enabled: true }
  }),
  site,
  vite: {
    server: {
      host: true,
      allowedHosts: ['.ngrok-free.dev', '.ngrok.io', '.e2b.app']
    }
  }
});
