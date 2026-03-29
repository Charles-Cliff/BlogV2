# Architecture

**Analysis Date:** 2026-03-29

## Pattern Overview

**Overall:** Astro-based static blog with SSR-ready architecture and page transitions (Swup)

**Key Characteristics:**
- Static Site Generation (SSG) with Astro content collections for blog posts
- Hybrid rendering: static pages + API endpoints for dynamic features (IndexNow)
- Component-based UI with Svelte islands for interactive elements
- CSS-first theming with CSS custom properties and dynamic hue rotation
- Page transitions managed via Swup for SPA-like navigation experience

## Layers

**Layout Layer:**
- Purpose: Base HTML structure, SEO metadata, theme initialization
- Location: `src/layouts/Layout.astro`
- Contains: HTML shell, head elements, global scripts, cookie consent, Swup integration
- Depends on: Config files (`src/config.ts`), constants
- Provides: `<slot />` for page content, `<slot name="head" />` for page-specific head content

**Main Grid Layout Layer:**
- Purpose: Three-column grid structure with sidebar, main content, and right-side widgets
- Location: `src/layouts/MainGridLayout.astro`
- Contains: Banner, Navbar, SideBar, main content slot, WritingStats widget, TOC
- Depends on: Layout.astro, widget components, config constants
- Used by: All main pages (home, posts, archive, etc.)

**Page Layer:**
- Purpose: Content pages that use layouts and components
- Location: `src/pages/` and subdirectories
- Contains: Home page (`[...page].astro`), post pages (`posts/[...slug].astro`), archive, friends, etc.
- Depends on: Layouts, content collections, utility functions

**Content Layer:**
- Purpose: Markdown/MDX content managed via Astro content collections
- Location: `src/content/`
- Collections: `posts`, `friends`, `spec`, `assets`
- Accessed via: `getCollection()`, `getSortedPosts()` from `src/utils/content-utils.ts`

**Component Layer:**
- Purpose: Reusable UI components organized by category
- Location: `src/components/`
- Categories: `widget/` (sidebar panels), `control/` (buttons, pagination), `misc/` (utilities)
- Depends on: Config, constants, utility functions

**Utility Layer:**
- Purpose: Helper functions for content, URLs, dates, settings
- Location: `src/utils/`
- Key files: `content-utils.ts`, `url-utils.ts`, `date-utils.ts`, `setting-utils.ts`, `writing-stats.ts`

**Config Layer:**
- Purpose: Site-wide configuration and type definitions
- Location: `src/config.ts`, `src/types/config.ts`, `src/constants/`
- Contains: Site config, navbar links, profile data, theme settings

## Data Flow

**Blog Post Rendering:**
1. `src/pages/posts/[...slug].astro` calls `getStaticPaths()`
2. `getStaticPaths()` uses `getSortedPosts()` from `src/utils/content-utils.ts`
3. `getSortedPosts()` fetches posts collection, filters drafts, sorts by date/pinned status
4. Page renders with `entry.render()` to get `Content` component and `headings`
5. Content passed to `Markdown` component wrapper for rendering
6. `MainGridLayout` receives `headings` prop for TOC generation

**Home Page Pagination:**
1. `src/pages/[...page].astro` uses `getStaticPaths()` with `paginate()`
2. `paginate()` splits `getSortedPosts()` results into pages of `PAGE_SIZE` (8)
3. `PostPage` component receives `page` prop with `page.data` (post array), `page.currentPage`

**Content Collection Schema:**
- Posts: `title`, `published`, `updated`, `draft`, `description`, `image`, `tags`, `lang`, `pinned`, `prerenderAll`
- Friends: `name`, `url`, `avatar`, `introduction`, `friendsPage`
- Spec: `title`, `published`, `updated`, `draft`

**URL Generation:**
- Posts: `/posts/{slug}/` via `getPostUrlBySlug()` in `src/utils/url-utils.ts`
- Archive: `/archive/`, `/archive/tag/{tag}/`
- Friends: `/friends/`
- Pages: Dynamic catch-all `[...page].astro` for static pages

## Key Abstractions

**Layout Hierarchy:**
```
Layout.astro (base HTML, head, body)
  └── MainGridLayout.astro (three-column grid)
        ├── Navbar.astro (top navigation)
        ├── SideBar.astro (left - Profile, Tags, NavMenu)
        ├── <slot /> (main content - posts, page content)
        ├── WritingStats.astro (right - 2xl+ only)
        ├── TOC.astro (right absolute - 3xl+ only)
        └── Footer.astro (bottom)
```

**Component Categories:**
- `widget/*`: Sidebar panels, stats displays, TOC, tags, profile - UI panels that live in the grid
- `control/*`: BackToTop, ButtonLink, ButtonTag, Pagination - interactive controls
- `misc/*`: ImageWrapper, License, Markdown - utility wrappers
- Root components: PostCard, PostMeta, PostPage, Navbar, Footer, ArchivePanel

**Swup Page Transitions:**
- Swup manages DOM replacement for SPA-like transitions
- `content:replace` hook reinitializes scrollbars and Fancybox
- `visit:start/end` hooks manage banner height and page height extension

## Entry Points

**Home Page:**
- Location: `src/pages/[...page].astro`
- Triggers: GET `/`, `/2`, `/3`, etc. (pagination)
- Responsibilities: Display paginated post list, SEO metadata

**Post Page:**
- Location: `src/pages/posts/[...slug].astro`
- Triggers: GET `/posts/{slug}/`
- Responsibilities: Render markdown content, show metadata, prev/next navigation

**Archive Page:**
- Location: `src/pages/archive/index.astro`, `src/pages/archive/tag/[tag].astro`
- Triggers: GET `/archive/`, `/archive/tag/{tag}/`

**Friends Page:**
- Location: `src/pages/friends.astro`
- Triggers: GET `/friends/`

**API Endpoints:**
- `src/pages/api/indexnow.ts`: IndexNow submission
- `src/pages/api/webhook/indexnow.ts`: IndexNow webhook
- `src/pages/rss.xml.ts`: RSS feed generation
- `src/pages/robots.txt.ts`: robots.txt generation

## Error Handling

**Strategy:** Graceful degradation with fallback values

**Patterns:**
- Image fallback: Configurable primary/fallback domains via `imageFallbackConfig`
- Banner: Falls back to site default if post image not provided
- Content: Draft posts filtered out in production via `import.meta.env.PROD`
- Theme: CSS variables with defaults, localStorage persistence

## Cross-Cutting Concerns

**SEO:** Layout.astro provides meta tags, OG tags, canonical URLs, JSON-LD schema
**Analytics:** Umami (cookie-free), Google Analytics (with consent banner), Google AdSense
**Theming:** CSS custom properties for hue, dark/light mode via class toggling
**Page Transitions:** Swup with custom hooks for scroll, scrollbars, banner height
**Cookie Consent:** Inline script banner with localStorage persistence

---

*Architecture analysis: 2026-03-29*
