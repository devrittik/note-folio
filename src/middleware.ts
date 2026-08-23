import {defineMiddleware} from 'astro:middleware';

export const onRequest=defineMiddleware(async(context,next)=>{
  const {pathname,search}=context.url;
  if(pathname.length>1&&pathname.endsWith('/')){
    const canonicalPath=pathname.replace(/\/+$/,'') || '/';
    return context.redirect(`${canonicalPath}${search}`,308);
  }
  return next();
});
