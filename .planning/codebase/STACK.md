# Technology Stack

**Analysis Date:** 2026-03-29

## Languages

**Primary:**
- TypeScript 5.8.3 - All source code in Astro components, pages, and utilities
- JavaScript  - Build scripts, plugins, and configuration

**Secondary:**
- CSS  - Styling via Tailwind and Stylus preprocessor

## Runtime

**Environment:**
- Node.js 20 (.nvmrc)
- pnpm 9.15.9 (packageManager in package.json)

**Package Manager:**
- pnpm 9.15.9
- Lockfile: `pnpm-lock.yaml` (committed)

## Frameworks

**Core:**
- Astro 5.7.9 - Static site generator with MPA architecture
  - Config: `astro.config.mjs`
  - Content collections for posts and friends

**UI Frameworks:**
- React 19.2.3 - Interactive components via `@astrojs/react`
- Svelte 5.28.2 - UI components via `@astrojs/svelte`

**Styling:**
- Tailwind CSS 3.4.17 - Utility-first CSS via `@astrojs/tailwind`
- Stylus 0.64.0 - CSS preprocessor for custom styles
- PostCSS  - CSS processing pipeline

**Markdown/Content:**
- markdown-it 14.1.0 - Markdown parsing
- rehype-katex 7.0.1 - KaTeX math rendering
- remark-math 6.0.0 - Math support
- sanitize-html 2.16.0 - HTML sanitization

**Code Highlighting:**
- astro-expressive-code 0.41.3 - Code block rendering
- @expressive-code packages 0.41.3

**Animations:**
- @swup/astro 1.6.0 - Page transition library

**Image Processing:**
- sharp 0.34.1 - Image optimization
- node-html-parser 7.0.1 - HTML parsing
- photoswipe 5.4.4 - Lightbox gallery
- @fancyapps/ui 6.0.5 - UI components

**Icon System:**
- astro-icon 1.1.5 - Icon integration
- @iconify/svelte 4.2.0
- Multiple Iconify icon sets (material-symbols, fa6-brands, fa6-regular, fa6-solid, simple-icons)

**SEO:**
- @astrojs/sitemap 3.3.1 - Sitemap generation

**RSS:**
- @astrojs/rss 4.0.11 - RSS feed generation

## Build Tools

**Bundler:**
- Vite (built into Astro) - Build and dev server

**Code Quality:**
- Biome 1.9.4 - Linting and formatting
  - Config: `biome.json`
  - Tab indentation, double quotes for JS

**Type Checking:**
- @astrojs/check 0.9.4 - Astro type checking
- @astrojs/ts-plugin 1.10.4 - TypeScript plugin for Astro

## Key Dependencies

**Critical:**
- astro 5.7.9 - Core framework
- @astrojs/react 4.4.2 - React integration
- @astrojs/svelte 7.0.12 - Svelte integration
- @astrojs/tailwind 6.0.2 - Tailwind integration

**Content Processing:**
- hastscript 9.0.1 - HAST utility
- mdast-util-to-string 4.0.0 - MD AST utilities
- unist-util-visit 5.0.0 - AST traversal
- remark-sectionize 2.1.0 - Section handling
- remark-directive 3.0.1 - Directive support
- remark-github-admonitions-to-directives 1.0.5 - Admonition conversion

**Rehype Plugins:**
- rehype-slug 6.0.0 - Heading IDs
- rehype-autolink-headings 7.1.0 - Heading links
- rehype-components 0.3.0 - Custom components
- rehype-external-links 3.0.0 - External link handling
- rehype-image-fallback - Custom plugin
- rehype-image-attrs - Custom plugin

**Styling:**
- @tailwindcss/typography 0.5.16 - Prose styling
- stylus 0.64.0 - CSS preprocessor

**Utilities:**
- reading-time 1.5.0 - Reading time calculation
- katex 0.16.22 - Math rendering
- sql.js 1.13.0 - SQLite in browser

**3D/WebGL (likely for special effects):**
- three 0.182.0 - 3D library
- @react-three/fiber 9.5.0 - React Three.js integration
- @types/three 0.182.0

**Fonts:**
- @fontsource-variable/jetbrains-mono 5.2.5 - Monospace font
- @fontsource/roboto 5.2.5 - Sans-serif font

## Configuration

**Environment:**
- `.nvmrc` - Node.js 20
- `.npmrc` - pnpm configuration (manage-package-manager-versions = true)

**Build:**
- `astro.config.mjs` - Astro configuration with multiple integrations
- `tailwind.config.cjs` - Tailwind with custom font, darkMode, typography plugin
- `postcss.config.mjs` - PostCSS with import, nesting, and tailwindcss
- `svelte.config.js` - Svelte preprocessing with vitePreprocess
- `tsconfig.json` - TypeScript with Astro strict config, path aliases (@components/*, @utils/*, etc.)

**Code Quality:**
- `biome.json` - Biome 1.9.4 with tab indentation, recommended rules

## Platform Requirements

**Development:**
- Node.js 20
- pnpm 9.15.9

**Production:**
- Static site output to `dist/`
- Deployable to Vercel, Cloudflare Pages, or any static host

---

*Stack analysis: 2026-03-29*
