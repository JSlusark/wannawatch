>Note to ai ordering this file: each block was pasted with a prompt line above it, so you can see what the user asked for and what you wrote. The top of the prompt should present a h1 of the block (which is added to the table of contents). The final version of the file should be:


```
- >Note (for ai)
- Table of contents
- List of blocks (each final block must have h1, intact original prompt and block which you SHOULD NOT change)

```

## Table of contents

1. [Breakdown of the project and workflow](#breakdown-of-the-project-and-workflow)
2. [Suggested-Step-by-step list of what to do yourself](#step-by-step-list-of-what-to-do-yourself)
3. [What do you recommend? Tailwind + CSS customization](#what-do-you-recommend-tailwind--css-customization)
4. [Next.js setup](#nextjs-setup)
5. [Can I use shadcn/ui?](#can-i-use-shadcnui)
6. [Project stack summary](#project-stack-summary)


---

# Breakdown of the project and workflow

> Prompt:  Breakdown of the project and workflow

Below are the notes, split into what the project should prove, how the workflow runs in stages, and how the stack grows from the start to the finished product.

## 1. What the project should demonstrate

For each skill: the tool that shows it and the concrete task that proves it.

**Component engineering**
- Tools: React, TypeScript (strict mode), Storybook
- Tasks: typed props with clear APIs, components built in isolation, every state covered as a story (default, loading, empty, error, edge cases like long titles or missing images)

| Tool | What it is | Why it is used | Where to use it in Wanna Watch and why | Skill it demonstrates |
|---|---|---|---|---|
| React | UI library for building interfaces from components | Industry standard for component-based frontends | Every UI piece (movie cards, lists, search, filters) is a component, so the app is built from reusable, testable parts | Component design, state management, composition |
| TypeScript (strict mode) | JavaScript with static types, strict mode enables the strongest checks | Catches errors at build time, makes component APIs self-documenting | Typed props for every component and typed API data (movie objects), so missing fields like a poster URL are handled explicitly | Type-safe API design, handling incomplete data |
| Storybook | Workbench for building and viewing components in isolation | Lets you develop and test components without the full app | Every component gets stories for each state (default, loading, empty, error, long title, missing poster) before it is used in a page | Building in isolation, thinking in states and edge cases |

**Styling and design system**
- Tools: Tailwind CSS v4, shadcn/ui (Base UI primitives), class-variance-authority + `cn()`
- Tasks: design tokens defined once in `@theme` and reused everywhere instead of raw values, generic interaction primitives (dialog, dropdown, popover, tabs) styled through shadcn/Base UI and restyled with your own tokens, typed variant props for every component with more than one visual state

| Tool | What it is | Why it is used | Where to use it in Wanna Watch and why | Skill it demonstrates |
|---|---|---|---|---|
| Tailwind CSS v4 | Utility-first CSS framework, configured in CSS via `@theme` instead of a JS config | Zero-runtime styling that works with Server Components; design tokens double as utility classes | Layout, spacing, color, and typography for every component, with tokens defined once in `globals.css` | Styling at scale without a runtime cost, working within the App Router's server/client boundary |
| shadcn/ui (Base UI primitives) | CLI that copies accessible component source into the repo, built on Base UI | Solves hard accessibility patterns (focus trapping, ARIA wiring, positioning) without hiding the code behind a package | Generic interaction primitives restyled through Wanna Watch's own tokens; domain components (MovieCard, filters) built by hand | Using a component library deliberately, and being able to explain the code you copied |
| class-variance-authority + `cn()` | Typed helper for building component variants (size, style, state) from Tailwind classes | Keeps variant logic typed and readable instead of long conditional class strings | Every component with more than one visual state, for example button variants or card sizes | Typed, maintainable component APIs |

**Accessibility and semantic HTML** (the main signal from the listing)
- Tools: Storybook a11y addon (axe), Playwright, manual screen reader checks, Lighthouse
- Tasks: correct HTML elements before ARIA, full keyboard navigation, visible focus states, focus management in overlays, color contrast checked automatically on every story

| Tool | What it is | Why it is used | Where to use it in Wanna Watch and why | Skill it demonstrates |
|---|---|---|---|---|
| Storybook a11y addon (axe) | Automated accessibility checker running on every story | Catches contrast, missing labels, and invalid ARIA automatically | Runs on all stories and fails tests on violations, so no component merges with detectable issues | Accessibility as a quality gate, not an afterthought |
| Playwright | Browser automation for end-to-end tests | Tests real keyboard interaction in real browsers | Keyboard-only flows: search, open trailer modal, close with Escape, focus returns to the trigger | Keyboard navigation and focus management |
| Manual screen reader checks | Testing with VoiceOver (built into macOS) | Automated tools catch only part of accessibility issues; announcements and reading order need a human check | Complex components: search suggestions, modal, rating control, filter chips | Real understanding of assistive technology, beyond passing automated checks |
| Lighthouse | Automated Chrome audit for performance, accessibility, SEO, and best practices | Catches whole-page accessibility and performance issues that per-component checks miss | Run on each page in stage 4; fix flagged accessibility and performance issues before shipping | Page-level accessibility and performance auditing |

**Testing strategy**
- Tools: Storybook interaction tests (`play` functions), Vitest + Testing Library, Playwright, MSW
- Tasks: behaviour tested at component level, logic tested in isolation, full user flows tested end to end. Being able to explain *which test type covers what* is the point, not the number of tests.

| Tool | What it is | Why it is used | Where to use it in Wanna Watch and why | Skill it demonstrates |
|---|---|---|---|---|
| Storybook interaction tests (`play` functions) | Scripted user interactions inside a story, run as tests by the Vitest addon | Tests component behaviour in a real browser, in the same place the component is developed | Clicking the watchlist button, typing in search, opening a dropdown | Behaviour testing at component level |
| Vitest | Fast test runner compatible with Vite | Runs unit tests and story tests in one tool | Logic outside rendering: runtime formatting, filtering and sorting movies, data transformation from the API | Testing logic in isolation |
| Testing Library | Utilities for testing components the way users use them (by role, label, text) | Encourages tests that do not depend on implementation details | Component tests outside Storybook when needed, querying elements by role | Writing tests that match user behaviour and support accessibility |
| Playwright | Browser automation for end-to-end tests | Tests complete flows across pages with the real app running | Search, open movie, add to watchlist, switch language | Full user flow testing, knowing which test level fits which risk |
| MSW | Mock Service Worker: intercepts network requests and returns fake API responses | Lets components and stories be tested against realistic, controllable data without a real backend | Fixture-based handlers for movie data in Storybook and Vitest: success, delay, error, empty responses | Testing against realistic data instead of the real network, covering states a live API won't reliably reproduce |

**Architecture decisions**
- Tools: Architecture Decision Records (ADRs), short markdown files in `/docs/adr`
- Tasks: one ADR per significant choice (styling approach, Playwright over Cypress, data fetching strategy, folder structure). Each one states context, options considered, decision, and consequences. This turns "I chose X" into visible reasoning an interviewer can read.

| Tool | What it is | Why it is used | Where to use it in Wanna Watch and why | Skill it demonstrates |
|---|---|---|---|---|
| Architecture Decision Records (ADRs) | Short markdown files documenting one decision each: context, options, decision, consequences | Makes reasoning visible and traceable after the fact | `docs/adr/` for styling approach, shadcn usage, Playwright over Cypress, data fetching, auth, hosting | Technical judgment, comparing options, communicating trade-offs |

**Code review and collaboration** (solo, but still demonstrable)
- Tools: GitHub pull requests, branch protection, CI checks, Chromatic UI review, Conventional Commits, commitlint, husky
- Tasks: no direct commits to `main`, every change through a PR with a description, CI must pass, visual changes approved in Chromatic. The commit and PR history then shows how you work.

| Tool | What it is | Why it is used | Where to use it in Wanna Watch and why | Skill it demonstrates |
|---|---|---|---|---|
| GitHub pull requests | Proposed changes reviewed before merging | Standard team workflow, creates a record of what changed and why | Every change on its own branch with a PR description and the checklist template | Structured, reviewable work |
| Branch protection (rulesets) | Rules on `main` that block direct pushes and unmerged checks | Enforces the workflow instead of relying on discipline | `main` accepts only PRs with passing checks | Understanding team safeguards |
| CI checks | Automated checks run on every PR | Guarantees quality before merge | Lint, type check, story tests, Storybook build | Quality automation |
| Chromatic UI review | Visual comparison of stories between the PR and `main` | Catches unintended visual changes code review misses | Every PR with UI changes; you approve or reject each visual diff | Visual regression awareness, UI review process |
| Conventional Commits | A commit message format: `type(scope): description` | Makes history readable and shows the kind of each change at a glance | Every commit, for example `feat(movie-card): add loading state` | Clear communication of changes to other developers |
| commitlint | Tool that checks commit messages against a convention | Catches malformed messages automatically | Configured in `commitlint.config.mjs` with the conventional preset | Enforcing team conventions with tooling |
| husky | Tool that stores Git hooks in the repo so they are shared | Git's own hooks in `.git/hooks/` are not committed; husky makes them part of the project | `.husky/commit-msg` runs commitlint before each commit is created | Setting up a consistent local workflow for any contributor |

**Changelog and release management**
- Tools: Changesets, squash merge workflow
- Tasks: run `npx changeset` on a feature branch to describe a change before opening its PR, squash every PR into one clean commit on `main`, let CI turn merged changesets into a versioned `CHANGELOG.md` and GitHub Release automatically

| Tool | What it is | Why it is used | Where to use it in Wanna Watch and why | Skill it demonstrates |
|---|---|---|---|---|
| Changesets | CLI + GitHub Action that turns small per-PR markdown files into a versioned `CHANGELOG.md` and GitHub Release | Automates the changelog and version bump from your own change descriptions instead of writing and maintaining `CHANGELOG.md` by hand | `npx changeset` on each feature branch before opening a PR; `.github/workflows/release.yml` runs `changesets/action` on every merge to `main` | Release engineering: turning commit and PR history into a scannable, versioned product timeline |
| Squash merge workflow | GitHub setting that collapses every commit on a PR branch into a single commit on `main` | Keeps local commits free-form ("wip", "fix typo") while `main` only ever receives one clean, Conventional-Commit-formatted message per PR | Enabled once branch protection is set up: `main` allows squash merging only, each PR titled with the final Conventional Commit message | Separating fast local iteration from a clean, auditable release history |

**Documentation for other developers**
- Tools: Storybook Docs (autodocs + MDX), README
- Tasks: every component documented with usage, props, and do/don't notes, written as if another team will use it


| Tool | What it is | Why it is used | Where to use it in Wanna Watch and why | Skill it demonstrates |
|---|---|---|---|---|
| Storybook Docs (autodocs + MDX) | Generated documentation pages from stories and props, extended with MDX for written content | Keeps docs next to the code and updated in the same PR | Every component page: props table, usage, do/don't notes; a Foundations page for design tokens | Writing documentation for other teams |
| README | The repo's entry point | First thing any reviewer or developer reads | Project purpose, setup, scripts, links to published Storybook and `docs/` | Clear onboarding communication |

**Internationalization**
- Tools: next-intl
- Tasks: no hardcoded UI strings from the first component, EN/DE support

| Tool | What it is | Why it is used | Where to use it in Wanna Watch and why | Skill it demonstrates |
|---|---|---|---|---|
| next-intl | Internationalization library for Next.js App Router | Handles translations, locale routing, and locale-aware formatting of dates and numbers | All UI text through message files from the first component; `/en` and `/de` routes; release dates and runtimes formatted per locale | Building for multiple languages from the start, avoiding costly retrofits |

**SEO and rendering choices**
- Tools: Next.js App Router, Metadata API
- Tasks: server rendering where content matters for search (movie pages), client components only where interaction requires it, with the boundary justified

| Tool | What it is | Why it is used | Where to use it in Wanna Watch and why | Skill it demonstrates |
|---|---|---|---|---|
| Next.js App Router | Routing and rendering system with Server and Client Components | Lets you choose per component whether it renders on the server or in the browser | Movie detail pages rendered on the server for search visibility and speed; interactive parts (search, watchlist button) as client components | Rendering strategy decisions with justification |
| Metadata API | Next.js API for page titles, descriptions, and social preview tags | Controls how pages appear in search results and when shared | Per movie page: title, description, poster as preview image, language alternates for EN/DE | SEO fundamentals |

**Deployment and CI/CD**
- Tools: GitHub Actions, preview deployments
- Tasks: lint, type check, tests, and Storybook build on every PR, automatic preview per PR

| Tool | What it is | Why it is used | Where to use it in Wanna Watch and why | Skill it demonstrates |
|---|---|---|---|---|
| GitHub Actions | CI/CD automation built into GitHub | Runs checks and deployments on every push and PR | The `ci.yml` pipeline, later extended with Playwright tests and deployment | Pipeline setup and maintenance |
| Preview deployments | A temporary deployed version of the app per PR | Lets you and reviewers test changes in a real environment before merge | Every PR from stage 5 on, once hosting is chosen | Deployment workflow understanding |

**Product thinking and experimentation** (final stage)
- Tools: PostHog
- Tasks: event tracking, feature flags, one real A/B test with a written hypothesis and result

| Tool | What it is | Why it is used | Where to use it in Wanna Watch and why | Skill it demonstrates |
|---|---|---|---|---|
| PostHog | Product analytics with event tracking, feature flags, and A/B testing (EU hosting available) | Measures real user behaviour and tests changes against each other | Track key events (search, add to watchlist); feature flags for new features; one A/B test, for example two layouts of the movie card, with hypothesis and result in `docs/experiments/` | Data-informed product decisions |


## 2. Workflow in stages

**Stage 0: Foundation** (before any component)
- Repository, Next.js + TypeScript strict, ESLint, Prettier
- Styling decision (CSS Modules or Tailwind, still open) and first ADR
- Storybook with `@storybook/nextjs-vite`, a11y addon, Vitest addon (runs your stories as tests)
- next-intl set up with *empty message files*
- GitHub Actions pipeline, Chromatic connected, branch protection on `main`
- Commit convention (Conventional Commits)

**Stage 1: Design foundation**
- Design tokens as CSS variables: colors (light/dark), spacing, typography, radius, breakpoints
- Smallest building blocks that every later component depends on
- Goal: later components use tokens only, never raw values

**Stage 2: Component building** (the loop for each component)
1. Write the stories first: define every state before implementing
2. Implement with semantic HTML and tokens
3. a11y addon shows zero violations; test keyboard use manually
4. Interaction test in the story (`play` function)
5. Unit test for any logic outside rendering
6. Docs: props, usage, accessibility notes
7. PR, CI passes, Chromatic review, merge

**Stage 3: Data-aware components**
- Fixture JSON with real API data
- MSW mocks for success, delay, error, empty responses
- Decide and document the data fetching approach (Server Components fetching vs TanStack Query on the client, or both with a clear rule for when each applies)

**Stage 4: Views (pages)**
- Compose components into routes and layouts
- Server/client component boundaries decided per page
- Metadata for SEO, i18n routing
- Playwright tests for the main user flows
- Lighthouse checks for performance and accessibility

**Stage 5: Full stack integration**
- Connect the real backend (your movie API), replace MSW in the running app (keep it in Storybook and tests)
- Authentication, environment variables, error handling across the network boundary
- Production deployment

**Stage 6: Product layer**
- PostHog analytics and feature flags (EU hosting, relevant for GDPR)
- One A/B test on a real flow
- Performance budgets and monitoring

## 3. Stack: start vs finished

| Area | At the start (stages 0 to 3) | Finished product |
|---|---|---|
| Framework | Next.js + TypeScript | Same |
| Styling | CSS Modules or Tailwind + design tokens | Same |
| Component workbench | Storybook, a11y addon, Vitest addon | Same, published via Chromatic |
| Unit tests | Vitest + Testing Library | Same |
| Visual review | Chromatic | Same |
| Data | Fixtures + MSW | Real API; MSW kept for tests and Storybook |
| End-to-end tests | Not yet | Playwright |
| i18n | next-intl, EN only filled | EN + DE |
| Backend | None | Your movie API + database |
| Auth | None | To decide in stage 5 |
| CI/CD | Lint, types, tests, Storybook build | Plus E2E tests, deployment |
| Hosting | None (Chromatic hosts Storybook) | To decide (your earlier hosting research applies) |
| Analytics | None | PostHog |

Two decisions are still open and should each get an ADR when you make them: styling (CSS Modules vs Tailwind) in stage 0, and the data fetching approach in stage 3.

If you want to keep and extend these notes, I can put them in a doc.

**Summary**
- The project should prove component engineering, styling and design system work, accessibility, testing strategy, architecture reasoning, review workflow, changelog and release management, documentation, i18n, SEO, CI/CD, and product experimentation.
- ADRs and a PR-based workflow make reasoning and code review visible even as a solo developer.
- Seven stages: foundation, design tokens, component loop, data-aware components, views, full stack integration, product layer.
- i18n and accessibility start in stage 0, because adding them later means rewriting components.
- MSW stays in the project after the real backend exists, for tests and Storybook.
- Open decisions: styling approach and data fetching strategy.

<div align="right">[Back to top](#table-of-contents)</div>

---

# Suggested Step-by-step list of what to do yourself

> Prompt: i like it, now can you give me a step by stem list of what i need to do myself to make this happen? like actual instructions

Below are the concrete steps, in order. Stages 0 to 2 are fully actionable now; stages 3 to 6 are shorter because they depend on decisions you will make along the way. Tool setups change often, so if a command prompt looks different from what I describe, follow the tool's official docs for that step.

## Before you start: decisions

1. **Pick the styling approach** (CSS Modules or Tailwind). You need this answer during step 3, because `create-next-app` asks about it.
2. **Decide repo visibility.** Branch protection on private repos requires GitHub Pro. The GitHub Student Developer Pack includes Pro, or you make the repo public.

## Stage 0: Foundation

**Project setup**

3. Install the current Node.js LTS. Create the project:
   ```bash
   npx create-next-app@latest wanna-watch
   ```
   Answer: TypeScript yes, ESLint yes, Tailwind according to your decision, `src/` directory yes, App Router yes, import alias default (`@/*`).
4. Create `.nvmrc` in the root with your Node version (for example `22`), so CI uses the same version. `nvm use` will switch your terminal to that version automatically.
5. In `tsconfig.json`, `strict: true` is already set. Add `"noUncheckedIndexedAccess": true` under `compilerOptions`. It forces you to handle possibly missing array items and object keys, which matters with API data.
6. Install Prettier and disable conflicting ESLint rules:
   ```bash
   npm i -D prettier eslint-config-prettier
   ```
   Add `prettier` to the ESLint config's extends, create `.prettierrc`.
7. Add scripts to `package.json`:
   ```json
   "typecheck": "tsc --noEmit",
   "format": "prettier --write ."
   ```
8. Create the folder structure:
   ```
   src/
     app/
     components/
       MovieCard/
         MovieCard.tsx
         MovieCard.module.css   (if CSS Modules)
         MovieCard.stories.tsx
         MovieCard.test.tsx     (only if there is logic to test)
         index.ts
     styles/tokens.css
     lib/
     mocks/
   messages/
     en.json
     de.json
   docs/adr/
   ```
   One folder per component keeps code, styles, stories, and tests together.

**Git and GitHub**

9. Create the GitHub repo, push the initial commit.
10. Set up branch protection: Settings > Rules > Rulesets (or Branches) > target `main` > require a pull request before merging, require status checks to pass. You add the actual checks after step 20, once they have run once.
11. Use Conventional Commits from now on (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`). Optional: enforce with `commitlint` + `husky` later.

**Storybook**

12. Install Storybook:
    ```bash
    npm create storybook@latest
    ```
    It detects Next.js. Choose the `@storybook/nextjs-vite` framework if asked. Accept the recommended setup (docs, a11y, vitest addons). If a11y or vitest were not included:
    ```bash
    npx storybook add @storybook/addon-a11y
    npx storybook add @storybook/addon-vitest
    ```
    The vitest addon runs your stories as tests in a real browser (via Playwright), so every story with a `play` function becomes a test.
13. Delete the example stories Storybook creates. Run `npm run storybook` to confirm it opens on `localhost:6006`.

**Unit tests**

14. Install Testing Library for tests outside Storybook:
    ```bash
    npm i -D @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
    ```
15. The Storybook vitest addon created a `vitest.config.ts` with a Storybook project. Add a second project for unit tests (environment `jsdom`, include `src/**/*.test.{ts,tsx}`), so `npx vitest` runs both. Check the Vitest docs on "projects" for the current config syntax.

**i18n**

16. Install and set up next-intl:
    ```bash
    npm i next-intl
    ```
    Follow the next-intl docs for the App Router "with i18n routing" setup, so URLs get `/en` and `/de` later. Put `{}` in both message files for now.
17. Wrap stories in the provider, in `.storybook/preview.tsx`:
    ```tsx
    import { NextIntlClientProvider } from 'next-intl';
    import messages from '../messages/en.json';

    // inside preview config:
    decorators: [
      (Story) => (
        <NextIntlClientProvider locale="en" messages={messages}>
          <Story />
        </NextIntlClientProvider>
      ),
    ],
    ```

**Chromatic**

18. Sign in at chromatic.com with GitHub, create a project linked to the repo, copy the project token.
19. Add the token as a repo secret: Settings > Secrets and variables > Actions > `CHROMATIC_PROJECT_TOKEN`.

**CI**

20. Create `.github/workflows/ci.yml`:
    ```yaml
    name: CI
    on:
      pull_request:
      push:
        branches: [main]

    jobs:
      checks:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: actions/setup-node@v4
            with:
              node-version-file: .nvmrc
              cache: npm
          - run: npm ci
          - run: npm run lint
          - run: npm run typecheck
          - run: npx playwright install --with-deps chromium
          - run: npx vitest run
          - run: npm run build-storybook

      chromatic:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
            with:
              fetch-depth: 0
          - uses: actions/setup-node@v4
            with:
              node-version-file: .nvmrc
              cache: npm
          - run: npm ci
          - uses: chromaui/action@latest
            with:
              projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
    ```
    `fetch-depth: 0` gives Chromatic the git history it needs to compare changes.
21. Push, let it run once, then go back to step 10 and add `checks` and `chromatic` as required status checks.

**PR template and ADRs**

22. Create `.github/pull_request_template.md` with the definition of done as a checklist:
    ```markdown
    ## What and why

    ## Checklist
    - [ ] All states covered as stories
    - [ ] No a11y violations, keyboard use tested manually
    - [ ] Interaction test (play function)
    - [ ] Unit tests for logic
    - [ ] No hardcoded UI strings
    - [ ] Docs updated
    - [ ] Visual changes reviewed in Chromatic
    ```
23. Create `docs/adr/template.md` with four sections: Context, Options considered, Decision, Consequences.
24. Write the first ADRs: `0001-styling-approach.md`, `0002-playwright-over-cypress.md`, `0003-nextjs-app-router.md`.
25. Write a short README: what the project is, how to run it, how to run tests and Storybook, link to the published Storybook.

## Stage 1: Design foundation

26. Define tokens: colors (light and dark), spacing scale, font sizes and weights, border radius, breakpoints, focus ring style.
    - CSS Modules: CSS variables in `src/styles/tokens.css` under `:root` and `[data-theme="dark"]`.
    - Tailwind v4: define them in `@theme` in `globals.css`.
27. Import the token file in `src/app/layout.tsx` and in `.storybook/preview.tsx`.
28. Check color pairs for contrast (WCAG AA: 4.5:1 for normal text) before using them.
29. Create a `Foundations/Tokens` MDX page in Storybook that displays the tokens. This is documentation other developers would use.
30. Build the smallest primitives first (the ones every other component will use), through the loop in stage 2.

## Stage 2: Component loop (repeat for each component)

31. Create a branch: `feat/component-name`.
32. Write the stories first: one per state (default, loading, empty, error, long content, disabled, and so on).
33. Implement with semantic HTML first; add ARIA only where HTML has no native equivalent.
34. All text through `useTranslations`, keys added to `en.json`.
35. Check the a11y panel in Storybook: zero violations. Then test with keyboard only (Tab, Shift+Tab, Enter, Space, Escape, arrow keys where relevant).
36. Add a `play` function for the main interaction.
37. Write Vitest unit tests only for logic that is not rendering (formatting, filtering, state reducers).
38. Enable autodocs (`tags: ['autodocs']` in the story file), add usage notes.
39. Open a PR, fill in the template, wait for CI, review and accept changes in Chromatic, merge.

## Stage 3: Data-aware components

40. Save 10 to 20 real responses from your movie API or TMDB as JSON in `src/mocks/fixtures/`.
41. Install MSW:
    ```bash
    npm i -D msw msw-storybook-addon
    npx msw init public/
    ```
42. In `.storybook/main.ts` set `staticDirs: ['../public']`. In `preview.tsx` call `initialize()` and add `mswLoader` to `loaders`.
43. Write handlers per story for success, slow response (`delay()`), error, empty.
44. Decide the data fetching approach and write the ADR before building the first data component.

## Stage 4: Views

45. Plan routes and layouts on paper first.
46. For each page, decide server vs client components and note why in the PR.
47. Add `generateMetadata` for pages that need SEO.
48. Install Playwright for end-to-end tests (`npm init playwright@latest`), write tests for the main user flows, add them to CI.
49. Run Lighthouse on each page; fix accessibility and performance issues.
50. Fill in `de.json`.

## Stage 5: Full stack integration

51. Connect the real API through environment variables (`.env.local`, never committed).
52. Remove MSW from the running app, keep it in Storybook and tests.
53. Decide on authentication, write the ADR, implement.
54. Choose hosting, set up production deployment and preview deployments per PR.

## Stage 6: Product layer

55. Create a PostHog account with EU hosting, install the Next.js integration.
56. Define the events that matter before tracking anything.
57. Add a cookie consent step, since analytics requires consent under GDPR.
58. Run one A/B test with a feature flag: write the hypothesis, the metric, the result, and the decision in `docs/experiments/`.

**Summary**
- Decide styling and repo visibility before creating the project.
- Stage 0 has 25 concrete steps covering Next.js, TypeScript, Prettier, Storybook with a11y and vitest addons, unit tests, next-intl, Chromatic, CI, branch protection, PR template, and ADRs.
- Stage 1 sets up design tokens with contrast checks before any real component.
- Stage 2 is a repeatable 9-step loop per component, enforced by the PR template.
- Stages 3 to 6 add mocked data, pages, the real backend, and analytics, each with its own decision recorded as an ADR.
- Rechecked: the Vitest multi-project config syntax and the next-intl routing setup change between versions, so those two steps point to the official docs instead of giving exact code.

<div align="right">[Back to top](#table-of-contents)</div>

---

# What do you recommend? Tailwind + CSS customization

> Prompt: what do you reccomend?  i like tailwing for the easyness and also ther libraries as well but i like to customize further with css too vecause i want to add small changes if i feel like it

Go with **Tailwind v4**. Your concern is based on a wrong assumption: Tailwind does not stop you from writing CSS. You can mix both freely, and v4 is built for it, because its configuration itself is written in CSS instead of a JavaScript config file.

**How to combine them**

Use a clear rule for what goes where, and write it into the styling ADR:

1. **Tailwind utilities by default** for layout, spacing, color, typography, states (`hover:`, `focus-visible:`, `disabled:`).
2. **Design tokens in `@theme`** in `globals.css`. Anything defined there automatically becomes a utility class, so your custom colors and spacing work like built-in ones:
   ```css
   @import "tailwindcss";

   @theme {
     --color-brand: oklch(0.65 0.2 25);
     --spacing-card: 1.25rem;
     --font-display: "Your Font", sans-serif;
   }
   ```
3. **Custom reusable utilities** with `@utility` when you need something Tailwind lacks:
   ```css
   @utility poster-fade {
     mask-image: linear-gradient(to bottom, black 70%, transparent);
   }
   ```
   Then use `poster-fade` as a class like any other.
4. **A CSS Module next to the component** for things that are awkward as utility classes: keyframe animations, complex selectors, detailed transitions. Add this line at the top so the module can use your theme:
   ```css
   @reference "../../app/globals.css";
   ```
   Adjust the path to where your `globals.css` is.
5. **Dark mode via `data-theme`** instead of only the system setting, so you can add a toggle:
   ```css
   @custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
   ```

What to avoid: heavy use of `@apply` to rebuild classic CSS classes out of utilities. It adds a layer without benefit; if you need that much custom styling, a CSS Module is cleaner.

For component variants (size, style, state), add `clsx` + `tailwind-merge` (combined in a `cn()` helper) and `class-variance-authority`. This is the standard pattern and keeps variant logic typed and readable.

**About the libraries**

This is where you need to be careful for a portfolio project. shadcn/ui (built on Radix) copies accessible component code into your repo, which is useful, but if every complex component comes from it, the project demonstrates less of your own accessibility work, and accessibility is the skill the listing values most. My recommendation:

- Build simpler components yourself (cards, buttons, rating display, filter chips).
- For the hard accessibility patterns (dialog, combobox, dropdown menu), either use Radix or React Aria as headless primitives and style them yourself, or build one of them fully yourself as a showcase piece.
- Document which you chose and why in an ADR. "I built the search combobox myself following the WAI-ARIA pattern, and used Radix for the dialog because focus trapping is solved there" is a strong interview answer.

**Change to the earlier steps**

- Step 3: answer yes to Tailwind.
- Step 8: `MovieCard.module.css` only exists when a component needs it, not by default.
- Step 26: tokens go into `@theme` in `globals.css`, not into a separate `tokens.css`.

**Summary**
- Tailwind v4 fits: it supports custom CSS through `@theme`, `@utility`, and CSS Modules with `@reference`.
- Rule: utilities by default, CSS Modules for animations and complex selectors, avoid heavy `@apply`.
- Use `cn()` + `class-variance-authority` for variants.
- Use component libraries selectively; build at least some accessibility-heavy components yourself.
- Updated steps 3, 8, and 26 accordingly.

<div align="right">[Back to top](#table-of-contents)</div>

---

# Next.js setup

```bash
npx create-next-app@latest wannawatch
```
✔ Would you like to use the recommended Next.js defaults? › No, customize settings

TypeScript: Yes
Linter: ESLint (if it offers Biome as an alternative: Biome is faster, but ESLint has the Next.js, accessibility (jsx-a11y), and Storybook plugins you want)
React Compiler: No, for now. It automatically memoizes components, which is useful, but it adds a Babel step to builds and needs separate setup for Storybook to behave the same as the app. Enable it later once the setup runs, and record that as an ADR.
Tailwind CSS: Yes
src/ directory: Yes
App Router: Yes
Import alias: keep the default @/*
AGENTS.md: Yes if you use AI coding tools in the repo, since it points them to the Next.js docs matching your installed version. It does nothing otherwise, so either answer is fine.

<div align="right">[Back to top](#table-of-contents)</div>

---

# Can I use shadcn/ui?

> Prompt: also do you think i can implement shad cn to make component building easier and chnage them as my likng? tytpically finding something already premate and changing it is better but am not sure how this will be viewed in terms of my skills ad frontend

Yes, use it, but deliberately. Using shadcn/ui is not viewed negatively; it is widely used in production and many companies build their internal component libraries the same way. What gets judged is not *whether* you used it, but *what you did with it* and whether you understand the code you copied.

**How it can look bad**

- Components left at the default styling. Reviewers recognize the default shadcn look immediately, and it reads as "assembled", not "built".
- Every component comes from shadcn, so the project shows no accessibility work of your own. For a role like the innn.it one, that removes your strongest signal.
- You cannot explain what the code does. shadcn copies the code into your repo, so it is your code now; an interviewer can point at any line and ask about it.

**How it looks good**

- You use it for generic interaction primitives where the hard part is solved behaviour (focus trapping, Escape handling, ARIA wiring, positioning): Dialog, DropdownMenu, Popover, Tooltip, Select, Tabs.
- You build the domain components yourself: MovieCard, poster grid, rating display, watchlist button, filters. These are what make the app yours.
- You build at least one hard pattern yourself as a showcase. The search combobox with suggestions is a good candidate: it is central to a movie app and tests real accessibility knowledge.
- You restyle everything through your own tokens, so nothing looks like default shadcn.
- You record the split in an ADR: what came from shadcn, what you built, and why. That turns a shortcut into a visible engineering decision.

Your statement that adapting something premade is better is true for production work, where time matters more than demonstration. In a portfolio, it holds only for the generic parts. The parts that show your skill should be yours.

**Practical impact on the setup**

Install shadcn **before stage 1** (design tokens). Its init writes CSS variables into `globals.css` (`--background`, `--primary`, `--muted`, and so on). If you create your own token system first, you end up with two parallel ones. Instead, run the init, then adapt its variables to your colors and add your own tokens beside them:

```bash
npx shadcn@latest init
npx shadcn@latest add dialog
```

Add components one at a time as you need them, not all at once. Unused copied code is dead weight a reviewer will notice.

For each shadcn component you add, go through the same stage 2 loop as your own ones: stories for every state, a11y check, interaction test. Read through the code once and make sure you could explain what the underlying primitive library handles for you.

**Summary**
- shadcn is acceptable and common; the default look and zero own a11y work are what hurt.
- Use it for generic interaction primitives, build domain components and one hard a11y pattern yourself.
- Restyle through your tokens and document the split in an ADR.
- Run `shadcn init` before stage 1 so its variables become your token base instead of a second system.

<div align="right">[Back to top](#table-of-contents)</div>

---

> Prompt: Select a component library Base UI (Recommended),React Aria, Radix UI
Pick **Base UI**.

Reasoning per option:

- **Base UI:** built by people who created Radix, together with the MUI team. Actively developed, reached stable v1, and it is now shadcn's default, so the shadcn docs and examples you will look at match your setup. Accessibility is solid.
- **React Aria (Adobe):** the strongest accessibility and internationalization behaviour of the three (tested across screen readers, handles right-to-left layouts, locale-aware date and number input). The trade-off is a different API style (render props, class name functions), a larger bundle, and fewer shadcn examples, so you will spend more time adapting things. Choose it only if you want accessibility to be *the* headline of the project and accept the extra effort.
- **Radix UI:** the most tutorials online, but development has slowed noticeably since its original creators moved to Base UI. Not a good choice for a new project, and that is also an argument you can make in the ADR.

Add one line to ADR 0001 (or a separate ADR 0002): which primitive library you chose and why the other two were not.

One consequence: tutorials and Stack Overflow answers for shadcn from before late 2025 assume Radix. Props and component structure differ slightly in Base UI, so when copying from older sources, check against the current shadcn docs.

No, you will have accessibility with any of the three. Base UI handles ARIA attributes, keyboard navigation, and focus management for every component it provides.

By "headline" I meant the main thing you want the project to be known for. React Aria goes further in edge cases (more screen reader combinations tested, right-to-left languages, locale-specific input formats). For a movie app in English and German, Base UI covers what you need; the difference only matters if you want to push accessibility to the most thorough level possible.

Pick Nova (the default).

These presets only set the starting look: icon library, font, radius, spacing density. I do not know the exact differences between each one, but it does not matter much here, because you will replace the colors and fonts with your own tokens in stage 1 anyway. **Nova gives you Lucide icons, which have the largest icon set, and Geist, which is already Next.js's default font.**

If you want to compare them visually first, the shadcn website has a preview for each preset.

<div align="right">[Back to top](#table-of-contents)</div>

---

# Project stack summary

> Prompt: can you add at the bottom a summary of the stack used for the project and what for

The full stack as decided so far. **Status** shows whether it is already set up in the repo or comes in a later stage. Internationalization (next-intl) was dropped, so it is not part of the stack.

| Area | Tool | What it is for | Status |
|---|---|---|---|
| Runtime | Node.js 26 (`.nvmrc`) + npm | Same Node version locally and in CI | Set up |
| Framework | Next.js 16 (App Router) | Routing, server and client components, production build | Set up |
| UI library | React 19 | Building the UI from components | Set up |
| Language | TypeScript (strict + `noUncheckedIndexedAccess`) | Typed props and API data, catching missing fields at build time | Set up |
| Styling | Tailwind CSS v4 | Utility classes and design tokens in `@theme` in `globals.css` | Set up |
| Styling | CSS Modules (with `@reference`) | Only for animations and complex selectors that are awkward as utilities | When needed |
| Component primitives | shadcn/ui on Base UI (Nova preset) | Accessible interaction primitives (dialog, dropdown, popover), copied into `src/components/ui` and restyled | Set up (`Button` added) |
| Variants | class-variance-authority + `cn()` | Typed component variants (size, style, state) | Set up |
| Icons and font | Lucide, Geist | Icon set and default font from the Nova preset | Set up |
| Component workbench | Storybook 10 (`@storybook/nextjs-vite`) | Building and viewing every component state in isolation | Set up |
| Accessibility | Storybook a11y addon (axe) | Automatic accessibility checks on every story | Set up |
| Accessibility | VoiceOver (manual) | Screen reader checks for complex components | Per component |
| Accessibility | Lighthouse | Page-level accessibility and performance audits | Stage 4 |
| Documentation | Storybook Docs (autodocs + MDX) | Props tables, usage and do/don't notes per component | Set up |
| Documentation | ADRs in `docs/adr/`, README | Recorded technical decisions and the repo entry point | Set up (ADR 0001 written) |
| Testing | Vitest | One runner for story tests (browser) and unit tests (jsdom) | Set up |
| Testing | Storybook interaction tests (`play`) | Component behaviour tests inside stories | Per component |
| Testing | Testing Library + jest-dom | Unit and component tests that query by role, label, and text | Set up |
| Testing | Playwright | Real browser for story tests now; end-to-end user flows later | Set up (E2E in stage 4) |
| Mock data | MSW + fixtures | Mocked API responses (success, delay, error, empty) for Storybook and tests | Stage 3 |
| Data fetching | Server Components and/or TanStack Query | Loading movie data; decision still open, gets an ADR | Stage 3 |
| Code quality | ESLint + Prettier | Linting (Next.js, Storybook rules) and consistent formatting | Set up |
| Commit workflow | Conventional Commits + commitlint + husky | Readable commit messages, checked by a Git hook before each commit | Set up |
| Code review | GitHub pull requests + branch protection + squash merge | Every change through a PR, one clean commit per PR on `main` | After pushing to GitHub |
| Visual review | Chromatic | Hosts Storybook and shows visual diffs per PR for approval | CI job written, account and token pending |
| CI/CD | GitHub Actions (`ci.yml`) | Lint, type check, tests, and Storybook build on every PR | Written, runs after pushing to GitHub |
| Release management | Changesets (`release.yml`) | Automatic `CHANGELOG.md`, version bumps, and GitHub Releases | Planned |
| SEO | Next.js Metadata API | Page titles, descriptions, and preview images for movie pages | Stage 4 |
| Backend and auth | Your movie API + database, auth to decide | Real data and user accounts | Stage 5 |
| Hosting | To decide | Production deployment and preview deployments per PR | Stage 5 |
| Analytics | PostHog (EU hosting) | Event tracking, feature flags, one A/B test | Stage 6 |

<div align="right">[Back to top](#table-of-contents)</div>