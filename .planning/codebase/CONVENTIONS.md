# Coding Conventions

**Analysis Date:** 2026-03-29

## Naming Patterns

**Files:**
- Astro components: PascalCase (e.g., `PostCard.astro`, `Layout.astro`, `Navbar.astro`)
- Svelte components: PascalCase (e.g., `Search.svelte`, `FloatingControls.svelte`)
- React components: PascalCase with `.tsx` extension (e.g., `AntigravityBg.tsx`)
- TypeScript utilities: camelCase (e.g., `content-utils.ts`, `url-utils.ts`, `date-utils.ts`)
- TypeScript types: PascalCase (e.g., `config.ts`, `constants.ts`)
- Directory names: kebab-case for feature directories (e.g., `src/components/widget/`, `src/components/control/`)

**Functions:**
- camelCase for function names (e.g., `getSortedPosts()`, `setTheme()`, `updateStatsUI()`)
- Async functions prefixed with `get` for data fetching (e.g., `getCollection()`, `getTagList()`)

**Variables:**
- camelCase for local variables
- UPPER_SNAKE_CASE for true constants in `constants.ts` (e.g., `PAGE_SIZE`, `LIGHT_MODE`, `BANNER_HEIGHT`)

**Types:**
- TypeScript types/interfaces: PascalCase (e.g., `SiteConfig`, `NavBarConfig`, `ProfileConfig`)
- Type exports use `type` keyword for type-only imports
- Enums: PascalCase name with UPPER_SNAKE values (e.g., `enum LinkPreset { Home = 0, Archive = 1 }`)

## Code Style

**Formatting:**
- Tool: Biome (version 1.9.4)
- Config file: `biome.json`
- Indent style: Tabs (not spaces)
- Quote style: Double quotes for JavaScript/TypeScript
- Organize imports: Enabled

**Key Biome Settings:**
```json
{
  "formatter": { "indentStyle": "tab" },
  "javascript": { "formatter": { "quoteStyle": "double" } },
  "linter": { "enabled": true, "rules": { "recommended": true } }
}
```

**Linting:**
- Commands: `pnpm lint` (check and fix), `pnpm format` (format only)
- Override for Astro/Svelte/Vue files: Disables `useConst` and `useImportType` rules

## Import Organization

**Order:**
1. Astro built-ins (e.g., `astro:content`)
2. External libraries (e.g., `react`, `svelte`)
3. Path aliases (e.g., `@components/*`, `@utils/*`, `@constants/*`)
4. Relative imports (e.g., `../config`, `./PostMeta.astro`)

**Path Aliases (from `tsconfig.json`):**
```json
{
  "@components/*": ["src/components/*"],
  "@assets/*": ["src/assets/*"],
  "@constants/*": ["src/constants/*"],
  "@utils/*": ["src/utils/*"],
  "@layouts/*": ["src/layouts/*"],
  "@/*": ["src/*"]
}
```

## TypeScript Usage

**Configuration:**
- Extends: `astro/tsconfigs/strict`
- `strictNullChecks`: true
- `allowJs`: false
- Declaration files: Enabled

**Patterns:**
```typescript
// Type-only imports
import type { SiteConfig, NavBarConfig } from "./types/config";

// Interface for component props
interface Props {
  title?: string;
  class?: string;
  entry: CollectionEntry<"posts">;
}
let { title, class: className } = Astro.props;

// Async data fetching
export async function getSortedPosts() {
  const allBlogPosts = await getCollection("posts", ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });
}
```

## Astro Component Patterns

**Frontmatter:**
```astro
---
import path from "node:path";
import type { CollectionEntry } from "astro:content";
import { Icon } from "astro-icon/components";
import { umamiConfig } from "../config";

interface Props {
  title: string;
  url: string;
}
const { title, url } = Astro.props;
---
```

**Template:**
- Use `class:list` for conditional classes
- Use `{expression}` for dynamic content
- Use `is:inline` on scripts that must run immediately
- Use `client:only="svelte"` or `client:only="react"` for client-side only components

**Slots:**
```astro
<slot name="head" />
<slot />
```

**Client Directives:**
- `client:only="svelte"` - Svelte components
- `client:only="react"` - React components

## Styling Conventions

**Approach:**
- Tailwind CSS as primary utility framework
- CSS custom properties (variables) via `--var-name` syntax
- Stylus (`.styl` files) for complex styles

**Tailwind Integration:**
```astro
<!-- Using Tailwind classes -->
<div class="flex flex-col-reverse md:flex-col w-full rounded-[var(--radius-large)]">

<!-- Using @apply in style blocks -->
<style is:global>
@tailwind components;
@layer components {
  .enable-banner.is-home #banner-wrapper {
    @apply h-[var(--banner-height-home)] translate-y-[var(--banner-height-extend)]
  }
}
</style>
```

**CSS Variables:**
- Defined in Astro frontmatter `<style define:vars={{coverWidth}}>`
- Or inline in `<style is:global define:vars={{ configHue }}>`

## Svelte Component Patterns

**Script Block:**
```svelte
<script lang="ts">
import Icon from "@iconify/svelte";
import { url } from "@utils/url-utils.ts";
import { onMount } from "svelte";

interface SearchResult {
  url: string;
  meta: { title: string };
  excerpt: string;
}

let keywordDesktop = "";
let result: SearchResult[] = [];
</script>
```

**Reactivity:**
```svelte
$: search(keywordDesktop, true);
```

**Event Handlers:**
```svelte
<button on:click={togglePanel}>Search</button>
<input bind:value={keywordDesktop} />
```

## React Component Patterns

**tsx Files:**
```typescript
import { useState, useEffect } from "react";

export default function AntigravityBg() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  // ...
}
```

## Git Workflow (Pre-commit Hook)

**Hook Location:** `scripts/pre-commit`

**Purpose:** Automatically updates `updated` timestamps on modified blog posts

**Behavior:**
1. Detects staged markdown files in `src/content/posts/*.md`
2. Runs `node scripts/update-post-timestamp.mjs` on each file
3. Re-stages the updated files

**Installation:**
```bash
pnpm run prepare
```
This copies `scripts/pre-commit` to `.git/hooks/pre-commit`

## Error Handling

**Patterns:**
- Use try-catch with async operations
- Console error logging for failures: `console.error('Error message:', error)`
- Optional chaining for safe property access: `entry.data.pinned === true`
- Nullish coalescing: `updated?.getTime() || published.getTime()`

## Logging

**Approach:** console-based logging
- `console.error()` for errors
- `console.warn()` for warnings
- Debug comments sometimes left in code (e.g., `// TODO`, `// FIXME`)

---

*Convention analysis: 2026-03-29*
