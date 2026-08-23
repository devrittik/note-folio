export interface BreadcrumbItem { name:string; path:string }

export function breadcrumbSchema(site:URL,items:BreadcrumbItem[]):Record<string,unknown>{
  return {
    '@context':'https://schema.org',
    '@type':'BreadcrumbList',
    itemListElement:items.map((item,index)=>({
      '@type':'ListItem',
      position:index+1,
      name:item.name,
      item:new URL(item.path,site).toString()
    }))
  };
}

export function itemListSchema(
  site:URL,
  name:string,
  items:Array<{name:string;path:string}>
):Record<string,unknown>{
  return {
    '@context':'https://schema.org',
    '@type':'ItemList',
    name,
    numberOfItems:items.length,
    itemListElement:items.map((item,index)=>({
      '@type':'ListItem',
      position:index+1,
      name:item.name,
      url:new URL(item.path,site).toString()
    }))
  };
}
