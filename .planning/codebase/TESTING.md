# Testing Patterns

**Analysis Date:** 2026-03-29

## Test Framework

**Status:** No formal test framework currently in use

**No test files detected** in the codebase:
- No `*.test.*` or `*.spec.*` files found
- No `test/` or `__tests__/` directories
- No Jest, Vitest, or other test runner configuration

## CI/CD Workflows

### Workflow 1: IndexNow Auto Submit

**File:** `.github/workflows/indexnow.yml`

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**Steps:**
1. Checkout repository
2. Setup Node.js 18
3. Setup pnpm 9.15.9
4. Install dependencies with `--frozen-lockfile`
5. Restore IndexNow submission cache
6. Build site: `pnpm build`
7. Submit to IndexNow incrementally: `pnpm submit-indexnow-inc`
8. Save submission cache

**Key Commands:**
```bash
pnpm install --frozen-lockfile
pnpm build
pnpm submit-indexnow-inc
```

### Workflow 2: Check Hot Ranking Changes

**File:** `.github/workflows/hot-ranking-check.yml`

**Triggers:**
- Scheduled: `cron: '0 16 * * *'` (UTC 16:00 = Beijing 0:00)
- Manual workflow dispatch

**Steps:**
1. Checkout repository
2. Fetch Umami analytics data for all posts
3. Sort posts by pageviews
4. Compare with cached ranking
5. If changed: update `src/data/post-views.json` and push

**Build Verification:** No explicit build step in this workflow.

### Workflow 3: Auto Merge Friends PR

**File:** `.github/workflows/friends-auto-merge.yml`

**Triggers:**
- `pull_request_target` with types: `opened`, `synchronize`

**Steps:**
1. Verify changed files are only in `src/content/friends/*.json`
2. Validate JSON structure and required fields
3. Check for backlinks to main site
4. Gate check (verify + validate + backlink must all pass)
5. Install pnpm and Node.js 20
6. Install dependencies with `--frozen-lockfile`
7. **Build check:** `pnpm build`
8. Auto-merge PR if all checks pass
9. Update friends order file
10. Comment on PR with validation results

**Build Verification:**
```bash
if pnpm build; then
  echo "status=pass" >> $GITHUB_OUTPUT
else
  echo "status=fail" >> $GITHUB_OUTPUT
fi
```

## Build Verification

**Type Checking:**
```bash
pnpm type-check        # tsc --noEmit --isolatedDeclarations
```

**Linting and Formatting:**
```bash
pnpm lint              # biome check --write ./src
pnpm format            # biome format --write ./src
```

**Full Build:**
```bash
pnpm build             # astro build
```

**Build Scripts (from `package.json`):**
```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "type-check": "tsc --noEmit --isolatedDeclarations",
    "format": "biome format --write ./src",
    "lint": "biome check --write ./src"
  }
}
```

## Linting and Formatting Tools

**Primary Tool:** Biome (version 1.9.4)

**Config File:** `biome.json`

**Settings:**
- Indent style: Tabs
- Quote style: Double quotes
- Import organization: Enabled
- Recommended rules: Enabled
- Overrides for `.svelte`, `.astro`, `.vue` files disable `useConst` and `useImportType`

**Ignored Paths:**
- `src/**/*.css`
- `src/public/**/*`
- `dist/**/*`
- `node_modules/**/*`

## Package Manager

**Manager:** pnpm (version 9.15.9)

**Lockfile:** `pnpm-lock.yaml` (committed to git)

**Installation:**
```bash
pnpm install              # Install dependencies
pnpm install --frozen-lockfile   # CI/CD preferred (exact versions)
```

## Local Development Verification

**Before committing, ensure:**
```bash
pnpm type-check    # TypeScript validation
pnpm lint          # Biome linting
pnpm build         # Full Astro build
```

**Note:** No automated pre-commit hook runs these checks. The pre-commit hook only auto-updates post timestamps.

## Recommendations for Testing

**Current Gap:**
- No unit tests
- No integration tests
- No E2E tests
- Build verification only occurs in CI, not locally pre-commit

**Recommended Improvements:**
1. Add Vitest for unit testing utility functions (`src/utils/*.ts`)
2. Add Playwright or Cypress for E2E testing
3. Add pre-commit hook to run `pnpm type-check && pnpm lint`
4. Add test coverage reporting

---

*Testing analysis: 2026-03-29*
