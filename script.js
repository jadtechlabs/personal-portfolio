'use strict';
document.documentElement.classList.add('js');
const config = window.SITE_CONFIG || {};
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
function safeUrl(value, local = false) {
  if (!value || typeof value !== 'string') return '';
  try { const url = new URL(value, location.href); return ['https:', 'http:'].includes(url.protocol) || (local && url.protocol === 'file:') ? url.href : ''; } catch { return ''; }
}
function el(tag, className, text) { const node = document.createElement(tag); if (className) node.className = className; if (text) node.textContent = text; return node; }
function link(text, url, className = '') { const a = el('a', className, text); a.href = safeUrl(url); a.target = '_blank'; a.rel = 'noopener noreferrer'; return a; }
function dateLabel(value) { const date = new Date(value); return Number.isNaN(date.valueOf()) ? '' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }); }
$$('[data-social]').forEach(a => { const url = safeUrl(config[a.dataset.social]); if (url) { a.hidden = false; a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; } else { a.hidden = true; } });
$$('[data-contact]').forEach(a => { if (config.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email)) a.href = `mailto:${config.email}`; else if (safeUrl(config.linkedin)) { a.href = config.linkedin; a.target = '_blank'; a.rel = 'noopener noreferrer'; } });
$('#year').textContent = new Date().getFullYear();
const toggle = $('.menu-toggle'), nav = $('#navigation');
function closeMenu() { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
toggle.addEventListener('click', () => { const open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); });
nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); toggle.focus(); } });
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => { for (const entry of entries) if (entry.isIntersecting) { $$('#navigation a').forEach(a => { const active = a.hash === `#${entry.target.id}`; a.classList.toggle('active', active); if (active) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); }); } }, { rootMargin: '-20% 0px -55% 0px' });
  document.querySelectorAll('main section[id]').forEach(s => observer.observe(s));
}
for (const [key, selector] of [['portrait', '#portrait'], ['speaking', '#speaking-photo']]) { if (safeUrl(config.photos?.[key], true)) $(selector).src = config.photos[key]; }
for (const key of ['running', 'cycling', 'hiking']) { const url = safeUrl(config.photos?.[key], true); if (url) document.querySelector(`[data-personal-image="${key}"]`).src = url; }
if (safeUrl(config.strava)) $('#strava-link').append(link('Follow my miles on Strava ↗', config.strava, 'inline-link'));
function addImage(parent, item) { if (safeUrl(item.image, true)) { const img = el('img'); img.src = item.image; img.alt = item.imageAlt || item.name; img.loading = 'lazy'; parent.append(img); } }
if (Array.isArray(config.projects) && config.projects.length) {
  $('#projects-grid').replaceChildren();
  config.projects.forEach(item => { const card = el('article', 'project-card'); addImage(card, item); card.append(el('span', 'tag', item.status || 'Project'), el('h3', '', item.name), el('p', '', item.description)); if (item.technologies?.length) card.append(el('p', 'meta', item.technologies.join(' · '))); const links = el('div', 'links'); for (const [key, label] of [['github', 'View code ↗'], ['demo', 'Live demo ↗']]) if (safeUrl(item[key])) links.append(link(label, item[key], 'inline-link')); card.append(links); $('#projects-grid').append(card); });
}
if (Array.isArray(config.events) && config.events.length) { const container = $('#events-grid'); config.events.forEach(item => { const card = el('article', 'article'); addImage(card, item); card.append(el('p', 'meta', [item.organization, dateLabel(item.date)].filter(Boolean).join(' · ')), el('h3', '', item.name), el('p', '', item.topic), el('p', '', item.description)); if (safeUrl(item.url)) card.append(link('Event details ↗', item.url)); container.append(card); }); }
async function getFeed(type) { if (!config.apiBase) throw new Error('Static hosting'); const base = config.apiBase.replace(/\/$/, ''); const response = await fetch(`${base}/${type}`, { signal: AbortSignal.timeout(15000) }); if (!response.ok) throw new Error('Feed unavailable'); const data = await response.json(); if (!Array.isArray(data.items)) throw new Error('Invalid feed'); return data; }
async function loadWriting() {
  if (!safeUrl(config.medium)) return;
  const box = $('#articles'); box.replaceChildren(el('p', '', 'Loading the latest writing…'));
  try { const data = await getFeed('medium'); if (!data.items.length) throw new Error('No articles'); box.replaceChildren(); data.items.slice(0,3).forEach(item => { if (!safeUrl(item.url)) return; const card = el('article', 'article'); card.append(el('time', 'meta', dateLabel(item.date)), el('h3', '', item.title), el('p', '', item.excerpt), link('Read on Medium ↗', item.url)); box.append(card); }); }
  catch { box.replaceChildren(link('Read My Writing on Medium ↗', config.medium, 'inline-link')); }
}
// Only same-origin JSON is read in the browser; RSS stays on the server / in GitHub Actions.
const newsHosts = new Map([['krebsonsecurity.com', 'KrebsOnSecurity'], ['thehackernews.com', 'The Hacker News'], ['www.bleepingcomputer.com', 'BleepingComputer'], ['bleepingcomputer.com', 'BleepingComputer']]);
function newsItems(data) {
  const now = Date.now(), seen = new Set();
  return (Array.isArray(data?.items) ? data.items : []).filter(item => {
    try {
      const url = new URL(item.url), date = Date.parse(item.date);
      if (url.protocol !== 'https:' || !newsHosts.has(url.hostname) || typeof item.title !== 'string' || !item.title.trim() || !Number.isFinite(date) || date > now + 86400000 || date < now - 14 * 86400000 || seen.has(url.href)) return false;
      seen.add(url.href); return true;
    } catch { return false; }
  }).sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 10);
}
function renderNews(data) {
  const items = newsItems(data);
  if (!items.length) return false;
  const box = $('#news-grid'); box.replaceChildren();
  items.forEach(item => {
    const card = el('article', 'news-card'), meta = el('div', 'meta');
    meta.append(el('span', '', newsHosts.get(new URL(item.url).hostname) + ' · '));
    const time = el('time', '', dateLabel(item.date)); time.dateTime = new Date(item.date).toISOString(); meta.append(time);
    const title = el('h3'); title.append(link(item.title, item.url)); card.append(meta, title); box.append(card);
  });
  box.hidden = false; const status = $('#news-status'); status.textContent = 'Recent Headlines · Original Reporting From External Publications'; status.hidden = false;
  return true;
}
async function loadNews() {
  // Render the saved snapshot first. Publisher cards are always visible, even without JavaScript.
  try {
    const url = new URL(config.newsSnapshot || './data/news.json', location.href);
    if (url.origin !== location.origin) throw new Error('Snapshot must be same-origin');
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (response.ok) renderNews(await response.json());
  } catch { /* Intentional publisher-only view. */ }
  if (config.apiBase) {
    try { renderNews(await getFeed('news')); } catch { /* Keep the snapshot or publisher cards. */ }
  }
}
// Keep external links consistent, including links rendered from editable configuration.
$$('a[href^="https://"]').forEach(a => { a.target = '_blank'; a.rel = 'noopener noreferrer'; });
document.addEventListener('click', e => { if (!e.target.closest('.site-header')) closeMenu(); });
window.addEventListener('resize', () => { if (window.innerWidth > 1200) closeMenu(); });
loadWriting(); loadNews();

// Pages CMS editable copy. The HTML remains the fallback for SEO and no-JavaScript visits.
async function loadCmsContent() {
  try {
    const response = await fetch('./content/site.json', { signal: AbortSignal.timeout(4000) });
    if (!response.ok) return;
    const data = await response.json();
    const get = path => path.split('.').reduce((value, key) => value?.[key], data);
    $$('[data-cms]').forEach(node => {
      const value = get(node.dataset.cms);
      if (typeof value !== 'string' || !value.trim()) return;
      if (node.dataset.cms === 'hero.title') node.innerHTML = value.replace(/\n/g, '<br>');
      else node.textContent = value;
    });
  } catch { /* Keep the built-in copy if CMS content is unavailable. */ }
}
loadCmsContent();
