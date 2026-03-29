# External Integrations

**Analysis Date:** 2026-03-29

## APIs & External Services

**Analytics:**
- Umami (self-hosted)
  - URL: https://umami.micostar.cc
  - Share ID: X9ZZZ5l2xErS44Rc
  - Timezone: Asia/Shanghai
  - Client: `public/js/umami-share.js` - Custom sharing script with localStorage caching

**SEO/Search Indexing:**
- IndexNow API
  - Endpoint: https://api.indexnow.org/IndexNow
  - Host: www.micostar.cc
  - Key: 4ff84931e3084c36bcc43c09ec05df75
  - Implementation: `src/pages/api/indexnow.ts` and `src/pages/api/webhook/indexnow.ts`
  - Scripts: `scripts/submit-indexnow.mjs`, `scripts/submit-indexnow-incremental.mjs`
  - CI Integration: GitHub Actions workflow

**External Image Services:**
- Primary Image API: https://img.micostar.cc/random (background images)
- Primary Image Bed: https://img.micostar.cc (new projects)
- Fallback Image Bed: https://image.cloudrunmax.top (R2, old projects)
- Anti-leech protection enabled for image domains

## Data Storage

**Databases:**
- None (static site with content in git)
- sql.js 1.13.0 in-browser SQLite (for post-views data)

**File Storage:**
- Cloudflare R2 (image.cloudrunmax.top) - Image hosting fallback
- Local: `src/data/post-views.json` - Browsing statistics

**Caching:**
- localStorage for Umami share data (1-hour TTL)

## Authentication & Identity

**Auth Provider:**
- None (public blog)
- Webhook security via Bearer token in `src/pages/api/webhook/indexnow.ts`
  - Secret: `indexnow-webhook-2024`

## Monitoring & Observability

**Analytics:**
- Umami self-hosted at umami.micostar.cc
- Tracks pageviews per post via `/api/websites/{WEBSITE_ID}/stats`
- Shared data via `/api/share/{SHARE_ID}`

**CI Monitoring:**
- GitHub Actions workflows for automated tasks

## CI/CD & Deployment

**Hosting:**
- Vercel (primary)
  - Config: `vercel.json`
  - Region: hkg1 (Hong Kong)
  - Build command: npm run build
  - Output directory: dist

- Cloudflare Pages/EdgeOne (secondary)
  - Config: `wrangler.jsonc` for Cloudflare Workers
  - Config: `edgeone.json` for EdgeOne-specific settings
  - Headers: `public/_headers` (Cloudflare Pages format)
  - Redirects: `public/_redirects`

**CI Pipeline:**
- GitHub Actions
  - `indexnow.yml` - Auto-submits URLs to IndexNow on main branch push
  - `hot-ranking-check.yml` - Daily check of post view rankings, updates `src/data/post-views.json`
  - `friends-auto-merge.yml` - Friend link management

## Environment Configuration

**Required env vars (for IndexNow):**
- `INDEXNOW_KEY` - IndexNow API key
- `INDEXNOW_HOST` - Host domain

**GitHub Variables:**
- `INDEXNOW_KEY` - GitHub Actions variable
- `INDEXNOW_HOST` - GitHub Actions variable

**Site URL:**
- Primary: https://www.micostar.cc
- Site configured in `astro.config.mjs`

## Webhooks & Callbacks

**Incoming Webhooks:**
- `/api/webhook/indexnow` (POST)
  - Authorization: Bearer token
  - Triggered by Vercel deploy hooks
  - Proxies to IndexNow API submission
  - Source: `src/pages/api/webhook/indexnow.ts`

**Outgoing Webhooks:**
- IndexNow API (api.indexnow.org) - SEO sitemap submission
- Vercel Deploy Hooks (implicit via GitHub Actions)

## Additional Services

**External Links in Config (`src/config.ts`):**
- Private AI site: https://ai0728.com.cn/
- Private cloud drive: https://cloudrunmax.top/
- Private image bed: https://image.cloudrunmax.top/
- Private AI image generation: https://aiimage.cloudrunmax.top/
- Private AI prompts: https://aiprompt.ai0728.com.cn/
- Prompt optimization tool: https://prompt.micostar.cc
- Notion links for certain posts
- CloudRun links

**Social Links:**
- Bilibili: https://space.bilibili.com/420378171
- GitHub: https://github.com/Besty0728

---

*Integration audit: 2026-03-29*
