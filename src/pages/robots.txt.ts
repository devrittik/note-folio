import type {APIRoute} from 'astro';

export const prerender=false;

export const GET:APIRoute=({site})=>{
  const origin=new URL('/',site);
  const body=[
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /studio',
    'Disallow: /_server-islands/',
    '',
    `Sitemap: ${new URL('/sitemap-index.xml',origin).toString()}`,
    ''
  ].join('\n');

  return new Response(body,{
    headers:{
      'content-type':'text/plain; charset=utf-8',
      'cache-control':'public, max-age=3600',
      'x-robots-tag':'noindex'
    }
  });
};
