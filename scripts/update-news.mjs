// Dependency-free build-time snapshot. Never delete usable headlines after an upstream failure.
import { readFile, writeFile } from 'node:fs/promises';
import { SOURCES, fetchSource, normalize } from '../shared/feeds.js';
const path = new URL('../public/data/news.json', import.meta.url);
let previous = { items: [] };
try { previous = JSON.parse(await readFile(path, 'utf8')); } catch {}
const results = await Promise.allSettled(SOURCES.map(fetchSource));
const fetched = results.flatMap((r, i) => {
  if (r.status === 'fulfilled') return r.value;
  console.warn(`Could not refresh ${SOURCES[i].name}; preserving recent saved items.`);
  return [];
});
const oldest = Date.now() - 14 * 86400000;
const items = normalize([...fetched, ...(previous.items || [])].filter(item => {
  try { const url = new URL(item.url); return url.protocol === 'https:' && SOURCES.some(s => s.hosts.includes(url.hostname)) && Date.parse(item.date) >= oldest && Date.parse(item.date) <= Date.now() + 86400000; } catch { return false; }
}), 10);
// Avoid a new commit when nothing has changed.
if (JSON.stringify(items) !== JSON.stringify(previous.items)) {
  await writeFile(path, JSON.stringify({ items, updatedAt: new Date().toISOString() }, null, 2) + '\n');
}
console.log(`Saved ${items.length} recent headlines.`);
