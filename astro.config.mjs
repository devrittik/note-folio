import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';
export default defineConfig({
  integrations: [react()],
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  site: 'https://example.dev',
  vite: {
    server: {
      host: true,
      allowedHosts: ['.ngrok-free.dev', '.ngrok.io', '.e2b.app']
    }
  }
});
