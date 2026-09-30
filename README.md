# Personal Portfolio — jadelahmad.com

One production website lives at the repository root. This package was compared with the public `jadtechlabs/personal-portfolio` repository at commit `be2f0916315c5eb4cb418c0c6b1f8895d3e7e5ac` on September 28, 2026. The live domain responded from GitHub Pages. No changes have been pushed or published.

## Upload This Package

1. Unzip `personal-portfolio-final.zip`.
2. In your existing repository, remove the **old `public/` folder** and **`assets/speaking-event.webp`**. The old public folder was an exact duplicate of the root site. The extra speaking image was not referenced by the site, configuration, functions, or tests.
3. Upload everything **inside** the new `personal-portfolio-final/` folder into the existing repository root, replacing matching files. This restores `public/` with only the news data. Include `.github/`; on a Mac, press Command–Shift–Period to show hidden folders.
4. Commit the changes to the same branch you already publish. Keep your current GitHub Pages and DNS settings.

Do **not** upload the ZIP itself or put a `personal-portfolio-final` folder inside the repository. Upload its contents. Do **not** delete `CNAME`, your `.git` folder, or the repository itself. The included `CNAME` is the exact original file containing `jadelahmad.com`. If earlier review files were uploaded, delete `REVIEW-PREVIEW.html`, `COMPLETE-CHANGED-FILES.md`, and `CHANGELOG.md`; none belongs in this package.

GitHub's web upload replaces matching files but does not remove absent files. The two removals in step 2 are therefore required to remove the old duplicates. No other files from the audited repository need to remain outside this package. If you have changed the repository since the audited commit, retain those independent changes until compared.

## Production Structure

```text
.github/
  workflows/refresh-news.yml
assets/
  cycling.webp
  hiking.webp
  jad-portrait.webp
  jad-speaking.webp
  running.webp
functions/
  api/medium.js
  api/news.js
public/
  data/news.json
scripts/
  update-news.mjs
shared/
  feeds.js
tests/
  feeds.test.js
CNAME
README.md
_config.yml
_headers
_routes.json
config.js
index.html
package.json
script.js
styles.css
```

`index.html`, `styles.css`, `script.js`, `config.js`, and `assets/` are the only production copies. `public/` contains JSON data only. `_config.yml` prevents GitHub Pages from publishing repository support code and this README; it does not change the publishing branch or custom domain. The existing function files are preserved for compatibility but are not called on GitHub Pages. `_headers` and `_routes.json` are preserved byte-for-byte; GitHub Pages does not execute Cloudflare routing or apply its header configuration.

## News And Links

The browser reads `public/data/news.json` from the same site; there is no browser RSS request and no call to a nonexistent GitHub Pages API. Ten retrieved headlines are included. Headline links, source names, and dates are displayed without article bodies. The three publisher cards always remain visible. Missing, malformed, or older-than-14-days headlines leave a clean publisher-only section. No public error message is shown.

The included GitHub workflow refreshes the snapshot approximately every six hours, commits changed data, and explicitly requests a rebuild of the existing GitHub Pages site. This avoids relying on a workflow-generated commit to trigger another build. It uses the repository's built-in token with contents and Pages write permissions; no personal token or new hosting provider is required. GitHub Actions must be permitted by repository policy; branch protection can block its commit. This workflow has been reviewed locally but has not been run in your account. If it cannot run, the snapshot and publisher fallback still work. Nothing in it changes the custom domain or Pages source settings.

GitHub reference: https://docs.github.com/en/rest/pages/pages#request-a-github-pages-build

LinkedIn remains the contact destination. Your unprovided Medium/GitHub/Strava URLs and email remain blank; their optional profile links stay hidden. To add these later, edit `config.js`. Main copy is in `index.html`; colors and responsive layouts are in `styles.css`.

## Final Audit

| Check | Result |
| --- | --- |
| Actual repository comparison | All 25 original files retrieved and compared; root HTML/CSS/JS/config matched the old public copies |
| Production copies | Exactly one index, stylesheet, browser script, configuration file, and asset set |
| Domain and host compatibility files | Original CNAME, _headers, and _routes.json preserved byte-for-byte |
| CSS, JS, image, anchor paths | All referenced local files and anchor targets resolve from the repository root |
| Personal photos | Running, cycling, and Mount Rainier images included, with alt text and correct paths |
| News behavior | Client script checks passed for successful, failed, and malformed snapshots; no API call occurs on GitHub Pages |
| Feed processing | Seven tests passed, covering parsing, deduplication, cache behavior, partial/total failures, and safe publisher links |
| Navigation | Script-level menu open/close and Escape/focus checks passed |
| Desktop/mobile | Responsive layouts and breakpoints reviewed in code; browser visual/interaction verification remains incomplete because browser installation failed in this environment |
| External URLs | Direct publisher URLs verified against feed data; reachable Hacker News links returned 200; other requests encountered timeouts or publisher access restrictions, including LinkedIn 999 and BleepingComputer 403, so not every destination could be confirmed live |
| Exposure | No previews, temporary files, credentials, workspace paths, or development URLs in production; supporting source is excluded from the Pages output |
| Actual deployment | Not performed; private repository Pages settings and workflow execution could not be verified |

This is a complete replacement package for the **audited repository content**, with the exact removals above. It preserves the existing root deployment layout. It is not a claim that an unperformed live deployment or unavailable browser visual check has passed.

Developer checks (Node 22 or newer): `npm test` and `npm run refresh:news`.
