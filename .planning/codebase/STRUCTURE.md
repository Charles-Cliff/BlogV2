# Codebase Structure

**Analysis Date:** 2026-03-29

## Directory Layout

```
F:\web_workplace\BestyBlog\
├── src/
│   ├── components/           # UI components organized by category
│   │   ├── widget/           # Sidebar panels, stats, TOC, tags
│   │   ├── control/          # Buttons, pagination, back-to-top
│   │   ├── misc/             # ImageWrapper, License, Markdown
│   │   ├── *.astro           # Root-level page components
│   │   └── *.svelte          # Interactive Svelte components
│   ├── constants/            # Static configuration values
│   │   ├── constants.ts      # Page size, banner heights, theme modes
│   │   ├── icon.ts           # Icon configurations
│   │   └── link-presets.ts   # Navbar link presets
│   ├── content/             # Astro content collections
│   │   ├── config.ts         # Collection schemas
│   │   ├── posts/            # Blog post Markdown files
│   │   ├── friends/          # Friend links JSON data
│   │   └── spec/             # Static pages (privacy, etc.)
│   ├── data/                 # Runtime data (post views JSON)
│   ├── layouts/              # Page layout wrappers
│   │   ├── Layout.astro      # Base HTML layout
│   │   └── MainGridLayout.astro # Three-column grid layout
│   ├── pages/                # Astro page routes
│   │   ├── api/              # API endpoints
│   │   ├── archive/           # Archive pages
│   │   ├── hot/              # Hot ranking pages
│   │   └── posts/            # Post slug pages
│   ├── plugins/              # Astro/rehype plugins for markdown
│   ├── stores/                # Svelte stores
│   ├── styles/                # Global CSS styles
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Utility functions
│   ├── config.ts             # Site configuration
│   └── env.d.ts              # Astro env types
├── public/                   # Static assets
├── scripts/                  # Build/maintenance scripts
└── configuration files (astro.config.mjs, tsconfig.json, etc.)
```

## Directory Purposes

**src/components/:**
- Purpose: Reusable UI components
- Contains: Astro components (`.astro`), Svelte components (`.svelte`), React components (`.tsx`)
- Sub-categories:
  - `widget/`: Sidebar widgets (Profile, SideBar, Stats*, Tags, TOC, UpdatedPosts, VisitorInfo, WritingStats, etc.)
  - `control/`: UI controls (BackToTop, ButtonLink, ButtonTag, Pagination)
  - `misc/`: Utility wrappers (ImageWrapper, License, Markdown)
  - Root: Post-related (PostCard, PostMeta, PostPage), layout (Navbar, Footer, ArchivePanel)

**src/constants/:**
- Purpose: Static values that do not change at runtime
- Contains:
  - `constants.ts`: PAGE_SIZE (8), banner heights, theme mode constants
  - `icon.ts`: Icon preset configurations
  - `link-presets.ts`: LinkPreset enum for navbar links

**src/content/:**
- Purpose: Markdown/MDX content managed via Astro content collections
- Contains:
  - `config.ts`: Collection schemas (posts, friends, spec, assets)
  - `posts/`: Blog posts as Markdown files with frontmatter
  - `friends/`: Friend link data as JSON files + `_order.json`
  - `spec/`: Static specification pages (privacy policy, friends.md)

**src/layouts/:**
- Purpose: Page structure wrappers
- Contains:
  - `Layout.astro`: Base HTML with head, body, Swup integration, theme init
  - `MainGridLayout.astro`: Three-column grid with sidebar, content, widget areas

**src/pages/:**
- Purpose: Astro file-based routing entry points
- Contains:
  - `[...page].astro`: Home page with pagination (catch-all route)
  - `posts/[...slug].astro`: Individual blog post pages
  - `archive/index.astro`: Archive listing
  - `archive/tag/[tag].astro`: Tag-filtered archive
  - `friends.astro`: Friends page
  - `hot/[...page].astro`: Hot posts ranking
  - `apps.astro`: Applications page
  - `donate.astro`: Donation page
  - `about.astro`, `about-privacy.astro`: Static pages
  - `api/indexnow.ts`: IndexNow API endpoint
  - `api/webhook/indexnow.ts`: IndexNow webhook
  - `rss.xml.ts`: RSS feed generator
  - `robots.txt.ts`: robots.txt generator

**src/plugins/:**
- Purpose: Custom markdown/Astro processing plugins
- Contains: rehype plugins for components, headings, images; remark plugins for excerpts, reading time

**src/stores/:**
- Purpose: Svelte reactive stores
- Contains: `readingProgress.ts` for tracking scroll position

**src/styles/:**
- Purpose: Global CSS styles
- Contains: `main.css`, `variables.styl`, `markdown.css`, `markdown-extend.styl`, `scrollbar.css`, `transition.css`, `expressive-code.css`

**src/types/:**
- Purpose: TypeScript type definitions
- Contains: `config.ts` with all configuration interfaces (SiteConfig, ProfileConfig, NavBarConfig, etc.)

**src/utils/:**
- Purpose: Helper functions for content, URLs, dates, settings
- Contains:
  - `content-utils.ts`: `getSortedPosts()`, `getTagList()`
  - `url-utils.ts`: URL generation helpers
  - `date-utils.ts`: Date formatting
  - `setting-utils.ts`: Theme/settings persistence
  - `writing-stats.ts`: Writing statistics calculation

## Key File Locations

**Entry Points:**
- `src/pages/[...page].astro`: Home page routing
- `src/pages/posts/[...slug].astro`: Blog post routing

**Configuration:**
- `src/config.ts`: Main site configuration (siteConfig, navBarConfig, profileConfig, etc.)
- `src/types/config.ts`: TypeScript interfaces for config
- `src/constants/constants.ts`: Static constants

**Core Logic:**
- `src/utils/content-utils.ts`: Post retrieval and sorting
- `src/layouts/Layout.astro`: Base layout with HTML shell
- `src/layouts/MainGridLayout.astro`: Page structure layout

**Testing:**
- No test directory detected; no Jest/Vitest config found

## Naming Conventions

**Files:**
- Astro components: `PascalCase.astro` (e.g., `PostCard.astro`, `MainGridLayout.astro`)
- Svelte components: `PascalCase.svelte` (e.g., `FloatingControls.svelte`)
- TypeScript/JS: `camelCase.ts` (e.g., `content-utils.ts`, `url-utils.ts`)
- Constants: `camelCase.ts` or `kebab-case.ts`
- Content: `kebab-case.md` for posts

**Directories:**
- Components: `PascalCase/` for categories (widget, control, misc)
- Utils, types, constants: `camelCase` or `kebab-case`
- Pages: `kebab-case/` for route groups

## Where to Add New Code

**New Blog Post:**
- Add Markdown file to `src/content/posts/{slug}.md`
- Frontmatter schema defined in `src/content/config.ts`

**New Friend Link:**
- Add JSON file to `src/content/friends/{name}.json`
- Update `_order.json` to include the new friend

**New Widget Component:**
- Place in `src/components/widget/` if it's a sidebar widget
- Use existing patterns (StatsOverview, Tags, etc.) as reference

**New Page:**
- Create in `src/pages/{path}/index.astro` or `src/pages/{path}/[slug].astro`
- Use `MainGridLayout` or `Layout` as base

**New Utility Function:**
- Add to appropriate file in `src/utils/` or create new file
- Export from utils barrel if pattern established

**New Configuration Option:**
- Add type definition to `src/types/config.ts`
- Add default value in `src/config.ts`
- Use in components via import from config

## Special Directories

**src/content/posts/:**
- Purpose: Blog post Markdown files with frontmatter
- Contains: 20+ blog posts about tech topics (AI, Unity, OpenWebUI, etc.)
- Frontmatter fields: title, published, updated, draft, description, image, tags, lang, pinned, prerenderAll

**src/content/friends/:**
- Purpose: Friend link data (JSON)
- Contains: Friend profile JSONs + `_order.json` for ordering
- Schema: name, url, avatar, introduction, friendsPage

**src/data/:**
- Purpose: Runtime-generated data (post views JSON)
- Generated: Yes (updated by external scripts)
- Committed: Yes (version controlled)

**src/plugins/:**
- Purpose: Markdown processing customizations
- Contains: rehype-component plugins, remark plugins
- These modify how Markdown is rendered

---

*Structure analysis: 2026-03-29*
