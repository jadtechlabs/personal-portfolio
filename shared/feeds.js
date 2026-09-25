// Server-only configuration. Only these fixed URLs are fetched; callers cannot supply URLs.
export const SOURCES = [
  { name: 'NIST', category: 'Cybersecurity', url: 'https://www.nist.gov/news-events/cybersecurity/rss.xml' },
  { name: 'NIST Cybersecurity Insights', category: 'Cybersecurity', url: 'https://www.nist.gov/blogs/cybersecurity-insights/rss.xml' },
  { name: 'CISA', category: 'Cybersecurity', url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml' },
  { name: 'FTC', category: 'Compliance', url: 'https://www.ftc.gov/news-events/news/press-releases/rss', filter: /privacy|data security|cyber|artificial intelligence|\bAI\b|algorithm|surveillance|children.*online/i }
];
const MAX_BYTES = 2_000_000;
export function decode(value) {
  return String(value || '').replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (whole, key) => {
    if (key[0] === '#') { const n = key[1].toLowerCase() === 'x' ? parseInt(key.slice(2),16) : parseInt(key.slice(1),10); return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : ''; }
    return ({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '})[key.toLowerCase()] || whole;
  });
}
export function clean(value) {
  return decode(String(value || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1'))
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
}
function tag(block, name) { const safe = name.replace(':','\\:'); return block.match(new RegExp(`<${safe}\\b[^>]*>([\\s\\S]*?)<\\/${safe}\\s*>`,'i'))?.[1] || ''; }
function httpUrl(value) { try { const url = new URL(decode(value).trim()); if (!['http:', 'https:'].includes(url.protocol)) return ''; url.hash=''; for(const key of [...url.searchParams.keys()]) if (/^utm_|^fbclid$|^gclid$/.test(key)) url.searchParams.delete(key); return url.href; } catch { return ''; } }
function classify(text, fallback) { if (/\bartificial intelligence\b|\bAI\b|\bLLM\b|machine learning|algorithmic|generative/i.test(text)) return 'AI Risk'; if (/privacy|compliance|regulat|governance|standard|framework/i.test(text)) return 'Compliance'; return fallback; }
// RSS 2.0 and Atom entries, including namespaces, CDATA, encoded HTML, and alternate links.
// No XML entity expansion or remote schema/DTD requests are performed.
export function parseFeed(xml, source) {
  if (!/<(?:rss|feed|rdf:RDF)\b/i.test(xml)) throw new Error('Not an RSS or Atom feed');
  const blocks = xml.match(/<item\b[^>]*>[\s\S]*?<\/item\s*>|<entry\b[^>]*>[\s\S]*?<\/entry\s*>/gi) || [];
  const result=[];
  for (const block of blocks.slice(0,100)) {
    const title=clean(tag(block,'title'));
    let rawLink=clean(tag(block,'link'));
    if (!rawLink) { const links=block.match(/<link\b[^>]*\/?\s*>/gi)||[]; const alternate=links.find(l=>!/\brel\s*=/.test(l)||/\brel\s*=\s*["']alternate["']/i.test(l)); rawLink=alternate?.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1]||''; }
    const url=httpUrl(rawLink), rawDescription=tag(block,'description')||tag(block,'summary')||tag(block,'content:encoded')||tag(block,'content');
    const description=clean(rawDescription);
    const date=new Date(clean(tag(block,'pubDate')||tag(block,'published')||tag(block,'updated')||tag(block,'dc:date')));
    if(!title||!url||Number.isNaN(date.valueOf())||date.valueOf()>Date.now()+86400000)continue;
    if(source.filter&&!source.filter.test(`${title} ${description}`))continue;
    const words=description.split(' ').filter(Boolean), excerpt=words.slice(0,32).join(' ')+(words.length>32?'…':'');
    result.push({title,url,date:date.toISOString(),excerpt,source:source.name,category:classify(`${title} ${description}`,source.category)});
  }
  return result;
}
export function normalize(items, limit=10) {
  const seenUrls=new Set(),seenTitles=new Set();
  return items.sort((a,b)=>Date.parse(b.date)-Date.parse(a.date)).filter(item=>{const title=item.title.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');if(seenUrls.has(item.url)||seenTitles.has(title))return false;seenUrls.add(item.url);seenTitles.add(title);return true;}).slice(0,limit);
}
async function fetchSource(source) {
  const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),9000);
  try {
    const response=await fetch(source.url,{headers:{Accept:'application/rss+xml, application/atom+xml, application/xml, text/xml'},signal:controller.signal,redirect:'error'});
    if(!response.ok)throw new Error('Upstream unavailable');
    if(Number(response.headers.get('content-length'))>MAX_BYTES)throw new Error('Feed too large');
    const reader=response.body.getReader();let size=0;const parts=[];
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BYTES){await reader.cancel();throw new Error('Feed too large');}parts.push(value);}
    const bytes=new Uint8Array(size);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.byteLength;}
    return parseFeed(new TextDecoder().decode(bytes),source);
  } finally {clearTimeout(timer);}
}
function json(value,status=200,ttl=600){return new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':status===200?`public, max-age=${ttl}`:'no-store','X-Content-Type-Options':'nosniff'}});}
export async function handleFeed(request,env,ctx,type) {
  if(request.method!=='GET')return json({error:'Method not allowed'},405);
  const canonical=new URL(request.url);canonical.search='';
  const key=new Request(canonical.href,{method:'GET'}),cache=globalThis.caches?.default;
  if(cache){const cached=await cache.match(key);if(cached)return cached;}
  let sources=SOURCES;
  if(type==='medium'){
    try{const url=new URL(env.MEDIUM_FEED_URL);if(url.protocol!=='https:'||url.hostname!=='medium.com'||!url.pathname.startsWith('/feed/'))throw new Error();sources=[{name:'Medium',category:'Writing',url:url.href}];}
    catch{return json({items:[],configured:false,updatedAt:new Date().toISOString()});}
  }
  const settled=await Promise.allSettled(sources.map(fetchSource));
  const successful=settled.filter(r=>r.status==='fulfilled');
  const items=normalize(successful.flatMap(r=>r.value),type==='medium'?3:10);
  const partial=successful.length!==sources.length;
  if(!items.length)return json({items:[],partial:true,error:'Feeds temporarily unavailable',updatedAt:new Date().toISOString()},503);
  const response=json({items,partial,updatedAt:new Date().toISOString()},200,partial?120:600);
  if(cache&&ctx?.waitUntil)ctx.waitUntil(cache.put(key,response.clone()));
  return response;
}
