# Jad Elahmad — personal website

A lightweight, responsive personal website in HTML, CSS, and vanilla JavaScript. It includes your supplied portrait and speaking photograph, editable project/event collections, and server-side RSS aggregation. No framework, database, API key, or AWS account is required.

## Put the code in GitHub

1. Unzip `jad-elahmad-website.zip` on your computer.
2. Open your GitHub repository and choose **Add file → Upload files**.
3. Drag the extracted contents into GitHub, including the `public`, `functions`, and `shared` folders. Upload the extracted files, not the ZIP itself.
4. Commit your changes. This saves the code; it does not automatically put a new website online unless you already connected a hosting service.

## Recommended: connect GitHub to Cloudflare Pages

1. In Cloudflare, open **Workers & Pages**, create a **Pages** project, and connect the GitHub repository.
2. Choose the `main` branch and **None** as the framework preset.
3. Leave the build command blank. Set **Build output directory** to `public` and leave **Root directory** blank.
4. Deploy. Cloudflare serves the static site and detects the `/functions` folder at the repository root. The news endpoint is `/api/news`.
5. Add your custom domain through that Pages project's **Custom domains** setting when you are ready. Keep your DNS on Cloudflare.

Use Git integration for this package. Uploading only the `public` folder through a drag-and-drop static deployment does not install the functions. Test the site at its Cloudflare address before pointing your domain to it.

## The files you will edit most

| File | Purpose |
| --- | --- |
| `public/index.html` | Main text and all seven sections |
| `public/styles.css` | Navy, blue, and white theme; mobile layouts |
| `public/config.js` | Social links, email, photo paths, projects, and speaking engagements |
| `public/script.js` | Navigation, editable collections, and feed display |
| `public/assets/` | Portrait, speaking photos, and any new photos |
| `shared/feeds.js` | RSS sources, normalization, deduplication, categories, and caching |
| `functions/api/news.js` | Cloudflare news endpoint |
| `functions/api/medium.js` | Cloudflare Medium endpoint |

## Add your links and contact address

Edit `public/config.js`. LinkedIn is already set to the URL you supplied. Medium, GitHub, Strava, and email are intentionally blank so no usernames or contact details are invented. Blank Medium/GitHub links are visibly marked “soon”; a blank Strava link is hidden. With no email, hiring and speaking inquiries go to LinkedIn.

To add a direct email inquiry link, set `email` to the address you want publicly visible. There is no contact form or private message storage.

## Activate Medium articles

1. Set `medium` in `public/config.js` to your full profile URL, such as `https://medium.com/@YOUR_USERNAME`.
2. In your Cloudflare Pages project's production environment variables, add `MEDIUM_FEED_URL` with the value `https://medium.com/feed/@YOUR_USERNAME`.
3. Redeploy. This endpoint fetches up to three posts server-side. The value is not a secret.

This initial version accepts Medium author feeds at `https://medium.com/feed/...`. Custom-domain publications need an explicit server-side allowlist change. If the feed fails, readers can still follow your Medium profile link.

## Add or replace photos

Put your photo in `public/assets/` and change its path in `public/config.js`. The portrait and speaking image are already included. Running and cycling photo areas appear automatically when their paths are set. WebP or compressed JPEG is recommended. Update image descriptions in `public/index.html` or `public/script.js` if the subject changes. Keep photographs under roughly 500 KB when practical.

The supplied event-sign photo is also included as `assets/speaking-event.webp` for a future event entry. Do not publish badge photos or other photos containing details you do not want public.

## Add projects and speaking events

The `projects` and `events` arrays in `public/config.js` contain commented examples of every supported field. Copy an example, remove its comment markers, and add real content. Leave unavailable links blank. The project placeholder disappears when you add the first project. Event cards appear below the speaking section when events are added.

Supported projects: name, description, technologies, image, imageAlt, GitHub link, demo link, status.
Supported events: name, organization, topic, date (`YYYY-MM-DD`), description, image, imageAlt, event URL.

No project accomplishments, event titles/dates, testimonials, employer names, or performance metrics have been invented. The supplied speaking photo is displayed without inferring an event history.

## News behavior

The server fetches configured NIST, CISA, and FTC feeds in parallel. FTC items are filtered for security, privacy, AI, and related topics. Results are normalized, stripped to plain text, deduplicated by headline and URL, sorted newest first, and capped at 10. Excerpts are limited to 32 words. The feed shows recent updates; it does not claim a human editorial ranking of importance.

Successful results are cached at the edge for 10 minutes (2 minutes when some sources fail). Each fetch has a 9-second timeout and 2 MB size limit. A source failure does not hide successful sources. If all sources fail, the site shows an honest unavailable state and direct links to source publications. Feeds may occasionally block requests or change URLs; edit `SOURCES` in `shared/feeds.js` to maintain them.

All news is rendered as text, not injected HTML. Readers follow links to the original publishers. There is no tracking or analytics installed. Google Fonts is the only third-party font request; system font fallbacks keep the site readable if it is blocked.

## GitHub Pages alternative

GitHub can store this code while Cloudflare hosts it; you do not need GitHub Pages as well.

If you choose GitHub Pages, publish the contents of `public/` as your site's root (or copy them into a `/docs` folder and configure Pages to publish that folder). The static site works, but GitHub Pages cannot execute the `/functions` endpoints. Deploy the RSS API separately, set `apiBase` in `public/config.js` to its URL, and configure that server to allow requests from your exact website origin. Cloudflare Pages with this repository is the simpler complete setup.

## Preview locally

From the extracted project directory, run `python3 -m http.server 8000 --directory public` and open `http://localhost:8000`. This previews layout and navigation. It does not run the API. Opening the HTML directly also does not run the API.

For the complete Cloudflare environment, use Cloudflare Wrangler's Pages development command against `public` and place `MEDIUM_FEED_URL` in a local `.dev.vars` file. Never commit `.dev.vars` or secrets.

## Validation completed

- JavaScript syntax checks.
- All local assets and internal section anchors resolve.
- RSS/Atom parsing, entity/CDATA handling, safe URL checks, date sorting, deduplication, partial source failures, caching, and Medium URL restriction tested with fixtures.
- Private preview's HTML, CSS, JS, and image routes tested.
- Semantic sections, image descriptions, keyboard focus styles, skip link, menu expanded state/Escape handling, reduced-motion support, and desktop/tablet/mobile CSS included.

Live upstream RSS requests could not be verified from the build environment because sources blocked access. Automated tests use fixtures, not live articles. No articles are fabricated. Real browser visual QA was unavailable in this build environment; inspect desktop and mobile on Cloudflare before going public. Medium requires your URL before end-to-end verification.

Official setup references:
- https://developers.cloudflare.com/pages/functions/get-started/
- https://www.nist.gov/coo/nist-rss-feeds
- https://www.cisa.gov/news-events/cybersecurity-advisories

The private review site is a separate deployment; this export is portable and does not require ChatGPT to host it.
