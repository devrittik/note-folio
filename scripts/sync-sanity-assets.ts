import 'dotenv/config';
import {createReadStream,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {createClient,type SanityClient} from '@sanity/client';
import {getCliClient} from 'sanity/cli';

const API_VERSION='2026-08-22';
const projectId=process.env.SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID;
const dataset=process.env.SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || 'production';
const token=process.env.SANITY_WRITE_TOKEN;
if(!projectId) throw new Error('SANITY_PROJECT_ID is required. Set it in .env before syncing assets.');

const client:SanityClient=token
  ? createClient({projectId,dataset,token,apiVersion:API_VERSION,useCdn:false,perspective:'raw'})
  : getCliClient({apiVersion:API_VERSION}).withConfig({useCdn:false,perspective:'raw'}) as unknown as SanityClient;

const documents=await client.fetch<Array<{_id:string;name?:string}>>(
  `*[_type == "siteSettings"]{_id,name}`
);
if(!documents.length) throw new Error('No siteSettings document exists. Create and publish Site Settings first.');

const ogPath=resolve('public/og-default.png');
const faviconPath=resolve('public/favicon.png');
if(!existsSync(ogPath)||!existsSync(faviconPath)) throw new Error('Fallback OG image or favicon PNG is missing from public/.');

const [ogAsset,faviconAsset]=await Promise.all([
  client.assets.upload('image',createReadStream(ogPath),{filename:'og-default.png',contentType:'image/png'}),
  client.assets.upload('image',createReadStream(faviconPath),{filename:'favicon.png',contentType:'image/png'})
]);

let transaction=client.transaction();
for(const document of documents){
  transaction=transaction.patch(document._id,(patch)=>patch.set({
    defaultSeoImage:{
      _type:'image',
      asset:{_type:'reference',_ref:ogAsset._id},
      alt:`${document.name || 'Engineering Notebook'} portfolio preview`
    },
    favicon:{_type:'image',asset:{_type:'reference',_ref:faviconAsset._id}}
  }));
}
await transaction.commit();
console.log(`Synced OG image and favicon to ${documents.length} site settings document${documents.length===1?'':'s'}.`);
