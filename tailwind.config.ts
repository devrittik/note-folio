import type { Config } from 'tailwindcss';
export default {content:['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],theme:{extend:{colors:{paper:'var(--paper)',ink:'var(--ink)',muted:'var(--muted)',signal:'var(--signal)'},fontFamily:{editorial:'var(--font-editorial)',mono:'var(--font-mono)'}}},plugins:[]} satisfies Config;
