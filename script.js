'use strict';
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
$$('[data-social]').forEach(a => { const url = safeUrl(config[a.dataset.social]); if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; } else { a.removeAttribute('target'); a.title = `${a.dataset.social === 'medium' ? 'Medium profile' : 'GitHub profile'} coming soon`; a.textContent = `${a.dataset.social === 'medium' ? 'Medium' : 'GitHub'} · soon`; } });
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
for (const key of ['running', 'cycling']) { const url = safeUrl(config.photos?.[key], true); if (url) { const box = $(`[data-photo="${key}"]`), img = el('img'); img.src = url; img.alt = `Jad Elahmad ${key}`; img.loading = 'lazy'; box.append(img); box.hidden = false; } }
if (safeUrl(config.strava)) $('#strava-link').append(link('Follow my miles on Strava ↗', config.strava, 'inline-link'));
function addImage(parent, item) { if (safeUrl(item.image, true)) { const img = el('img'); img.src = item.image; img.alt = item.imageAlt || item.name; img.loading = 'lazy'; parent.append(img); } }
if (Array.isArray(config.projects) && config.projects.length) {
  $('#projects-grid').replaceChildren();
  config.projects.forEach(item => { const card = el('article', 'project-card'); addImage(card, item); card.append(el('span', 'tag', item.status || 'Project'), el('h3', '', item.name), el('p', '', item.description)); if (item.technologies?.length) card.append(el('p', 'meta', item.technologies.join(' · '))); const links = el('div', 'links'); for (const [key, label] of [['github', 'View code ↗'], ['demo', 'Live demo ↗']]) if (safeUrl(item[key])) links.append(link(label, item[key], 'inline-link')); card.append(links); $('#projects-grid').append(card); });
}
if (Array.isArray(config.events) && config.events.length) { const container = $('#events-grid'); config.events.forEach(item => { const card = el('article', 'article'); addImage(card, item); card.append(el('p', 'meta', [item.organization, dateLabel(item.date)].filter(Boolean).join(' · ')), el('h3', '', item.name), el('p', '', item.topic), el('p', '', item.description)); if (safeUrl(item.url)) card.append(link('Event details ↗', item.url)); container.append(card); }); }
async function getFeed(type) { const base = (config.apiBase || './api').replace(/\/$/, ''); const response = await fetch(`${base}/${type}`, { signal: AbortSignal.timeout(15000) }); if (!response.ok) throw new Error('Feed unavailable'); const data = await response.json(); if (!Array.isArray(data.items)) throw new Error('Invalid feed'); return data; }
async function loadWriting() {
  if (!safeUrl(config.medium)) return;
  const box = $('#articles'); box.replaceChildren(el('p', '', 'Loading the latest writing…'));
  try { const data = await getFeed('medium'); if (!data.items.length) throw new Error('No articles'); box.replaceChildren(); data.items.slice(0,3).forEach(item => { if (!safeUrl(item.url)) return; const card = el('article', 'article'); card.append(el('time', 'meta', dateLabel(item.date)), el('h3', '', item.title), el('p', '', item.excerpt), link('Read on Medium ↗', item.url)); box.append(card); }); }
  catch { box.replaceChildren(el('p', '', 'The latest articles are unavailable here right now.'), link('Read my writing on Medium ↗', config.medium, 'inline-link')); }
}
async function loadNews() {
  const box = $('#news-grid');
  try { const data = await getFeed('news'); if (!data.items.length) throw new Error('No updates'); box.replaceChildren(); const items = data.items.filter(item => safeUrl(item.url)).slice(0,10); if (!items.length) throw new Error('No valid updates');
    items.forEach(item => { const card = el('article', 'news-card'); card.append(el('span', 'small-label', item.category), el('h3', '', item.title), el('div', 'meta', [item.source, dateLabel(item.date)].filter(Boolean).join(' · ')), el('p', '', item.excerpt), link('Read article ↗', item.url)); box.append(card); });
    $('#news-status').textContent = `${items.length} updates · Checked ${dateLabel(data.updatedAt)}${data.partial ? ' · Some sources unavailable' : ''}`;
  } catch { $('#news-status').textContent = 'Live updates temporarily unavailable'; const card = el('div', 'news-error'); card.append(el('h3', '', 'Go straight to the source.'), el('p', '', 'The latest headlines couldn’t be loaded. Explore the source publications below for current updates.')); box.replaceChildren(card); }
}
loadWriting(); loadNews();
