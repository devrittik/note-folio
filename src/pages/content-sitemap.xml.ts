import type {APIRoute} from 'astro';
import {getJournalEntries,getProjects} from '../lib/data';

export const prerender=false;

const escapeXml=(value:string)=>value.replace(/[<>&'\"]/g,(character)=>({
  '<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'
}[character]!));

export const GET:APIRoute=async({site})=>{
  const [projects,journals]=await Promise.all([getProjects(),getJournalEntries()]);
  const urls:Array<{loc:string;lastmod?:string}>=[];

  projects.forEach((project)=>urls.push({
    loc:new URL(`/work/${project.slug}`,site).toString(),
    lastmod:project.updatedAt
  }));
  journals.forEach((entry)=>urls.push({
    loc:new URL(`/journal/${entry.slug}`,site).toString(),
    lastmod:entry.updatedAt || entry.date
  }));

  const workPages=Math.ceil(projects.length/4);
  const journalPages=Math.ceil(journals.length/4);
  for(let page=2;page<=workPages;page+=1) urls.push({loc:new URL(`/work?page=${page}`,site).toString()});
  for(let page=2;page<=journalPages;page+=1) urls.push({loc:new URL(`/journal?page=${page}`,site).toString()});

  const body=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((item)=>`  <url><loc>${escapeXml(item.loc)}</loc>${item.lastmod?`<lastmod>${escapeXml(item.lastmod)}</lastmod>`:''}</url>`).join('\n')}\n</urlset>\n`;

  return new Response(body,{
    headers:{
      'content-type':'application/xml; charset=utf-8',
      'cache-control':'public, max-age=300, stale-while-revalidate=3600'
    }
  });
};
