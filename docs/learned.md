These are fantastic questions. It can feel really strange moving your files around like this, but there is a brilliant engineering reason behind it.
Here is exactly why Next.js uses [locale] and why it doesn’t come built-in right out of the box.
------------------------------
## 1. What is [locale] and why is it in brackets []?
In Next.js, square brackets [...] mean Dynamic Routing [Next.js Routing System](https://nextjs.org/docs). It tells Next.js: "This folder name is a variable that will change depending on what the user types into the browser URL."
Instead of creating separate folders for every single language (like a folder for /en/, another for /de/, another for /fr/), you create just one folder named [locale].

* 
* If a user visits ://example.com, Next.js maps [locale] to en.
* If a user visits ://example.com, Next.js maps [locale] to de.
* 

The framework intercepts that variable name (locale) so your code knows exactly which language translations to load.
------------------------------
## 2. Why do we move layout.tsx and page.tsx inside [locale]?
We move them inside [locale] so that every single page in your application becomes multilingual by default.
Next.js reads folder structures as URL paths Next.js Routing System.

* 
* When layout.tsx and page.tsx were directly in the app/ folder, your homepage URL was just ://example.com.
* By moving them into src/app/[locale]/, your new homepage URL automatically requires a language code, like ://example.com or ://example.com.
* 

Because layout.tsx is now inside the language folder, it can automatically wrap your entire website in the correct language HTML tag, like <html lang="en"> or <html lang="de">.
------------------------------
## 3. Why doesn't Next.js provide this in advance?
Next.js purposefully leaves this out of a fresh project for three major reasons:

* 
* Unnecessary Bloat for Local Apps: A massive percentage of websites built on Next.js are only meant for one language (e.g., an internal company tool or a local business site). Forcing a complex multi-language structure on every single developer would make simple apps unnecessarily complicated.
* Flexibility in Technical Choices: There is no single "correct" way to do internationalization. Some developers prefer using a sub-domain strategy (like ://example.com instead of ://example.com). Others prefer different libraries like next-i18next or paraglide instead of next-intl. Next.js keeps the canvas completely blank so you can choose the tool that fits your project best.
* The "Lean Framework" Philosophy: Next.js focuses on being an incredibly fast layout engine and hosting framework. It intentionally leaves specialized tasks—like database connections, state management, and translations—to ecosystem packages like next-intl.
* 

Quick questions if you have time:

* How clear was the explanation of square brackets []?
* What should we look at next?


---

>> why did you suggest [locale] and  next-intl?

Two separate decisions, each with its own reason.

**Why i18n at all**

It was in the plan from the job listing analysis: internationalization was a bonus point there, and an EN/DE app fits a Berlin portfolio. The main reason to do it now instead of later is cost. If every UI string goes through a translation key from the first component, adding German later is only filling in `de.json`. If you hardcode strings first, you have to go back through every component and replace them, which is exactly the kind of refactor you want to avoid.

**Why next-intl**

- It is built for the App Router and works in Server Components as well as Client Components. `react-i18next`, the other common option, was designed for client-side React and needs extra setup to work well with Server Components.
- Next.js's own built-in i18n config only exists in the Pages Router; the App Router has none, so you need a library.
- It is the most widely used choice for Next.js App Router projects, so documentation and examples are easy to find.

**Why `[locale]` in the URL**

`[locale]` is a dynamic route segment, so every page exists as `/en/...` and `/de/...`. The benefits:

- **SEO:** search engines index each language version separately. With the language stored only in a cookie, they would see one version.
- **Server rendering:** the server knows the language from the URL, so the page is rendered in the right language on the first response.
- **Shareable links:** a German link opens in German for whoever receives it.

The alternative is next-intl *without* i18n routing: the locale comes from a cookie or browser setting, no `[locale]` folder, no `proxy.ts`. It is simpler to set up, and a valid choice if SEO per language does not matter to you. For a movie app with public movie pages, and a listing that explicitly mentions SEO, the URL-based approach is the better argument.

If you decide German is not worth it for this project, dropping i18n entirely is also defensible. It just has to be a decision you make now, not after 20 components.
---

Yes, npm i next-intl is exactly the same as npm install next-intl.
In npm, i is simply a built-in shortcut (an alias) for the word install to save you some typing. Both commands will look up the next-intl package, download it to your node_modules folder, and add it to your package.json file.
Now that next-intl is ready to go, would you like to install and set up Storybook next, or do you want to start writing your first UI component?
---
.nvmrc stands for Node Version Manager Run Command (or Node Version Manager configuration file).
Breaking down the name makes its purpose clear:

* nvm: Refers to Node Version Manager, the command-line tool developers use to install and switch between different versions of Node.js on a single computer.
* rc: A historic programming convention dating back to Unix systems (standing for Run Command or Run Control). In modern development, anytime a file ends in rc (like .eslintrc, .babelrc, or .nvmrc), it represents a configuration file that sets up rules for a specific tool.

## What it does in plain English
It acts as a pinned label on your project. It tells anyone opening the project folder—and any automated deployment server (like Vercel or GitHub Actions)—exactly which version of Node.js must be used to run your code safely.

Example: If your .nvmrc file contains the number 26, it means "This project is built for Node.js version 26. If you are using a different version, switch to 26 first."

```
bash
nvm use
```

Your terminal will read the .nvmrc file and automatically switch to Node 26 for you.

---

>> why vitest chosen for the project? why use it over jest?

Vitest, for one reason that decides it in this project and several that support it.

**The deciding reason: Storybook's test integration runs on Vitest**

The Storybook Vitest addon turns every story (and its `play` function and a11y check) into a test. It is built on Vitest's browser mode and has no Jest equivalent. With Jest, you would run two test runners side by side: Vitest for stories anyway, and Jest for unit tests. That means two configs, two sets of mocks, two commands in CI, for no benefit. With Vitest, one runner covers both.

**Supporting reasons**

- **TypeScript and ESM without extra setup.** Vitest handles TypeScript and ES modules directly through Vite. Jest needs a transform layer (Babel, `ts-jest`, or Next.js's `next/jest` wrapper), and its native ES module support is still marked experimental. Modern packages increasingly ship ESM only, which is where Jest setups break most often.
- **Speed.** Vitest reuses Vite's transform pipeline and has a fast watch mode that only reruns tests affected by a change. The difference is noticeable during development, less so in CI for a project this size.
- **Real browser testing.** Vitest can run tests in an actual browser (via Playwright). Jest runs in jsdom, a simulated DOM that does not do layout, real focus behaviour, or CSS. For a project that emphasizes accessibility and focus management, testing in a real browser is more reliable.

**Your Jest knowledge transfers**

The API is almost identical: `describe`, `it`, `expect`, matchers, and Testing Library all work the same. The main visible difference is `vi.fn()` and `vi.mock()` instead of `jest.fn()` and `jest.mock()`. Switching takes an afternoon, not a relearning.

**Where Jest is the better choice**

- Existing large codebases already on Jest: migrating has a cost and little payoff.
- React Native projects, where Jest is the default and best supported.
- Teams relying on Jest-specific plugins without Vitest equivalents.

Jest still appears in many job listings because of those existing codebases. Knowing both and being able to explain why you picked Vitest here is a stronger position than knowing only one. This is a good candidate for a short ADR: "Vitest over Jest, because the Storybook test integration requires it and it avoids a second runner."

**Summary**
- Vitest is required for Storybook's story tests, so using Jest would mean running two test runners.
- Vitest also handles TypeScript and ESM natively and can test in a real browser.
- The API is nearly identical to Jest; your existing knowledge carries over.
- Jest remains the right choice for existing Jest codebases and React Native.

---

Everything checks out — typecheck and lint pass clean, and Storybook now compiles with Tailwind + shadcn tokens correctly.

## What was already in good shape
Next.js 16 + TS strict + Tailwind v4 + shadcn (Base UI/Nova preset, `Button` component) + Storybook (a11y, docs, vitest, chromatic addons) + Vitest/Testing Library + ESLint/Prettier + Husky/commitlint were all installed and mostly wired correctly.

## What I fixed
1. **Storybook wasn't actually loading Tailwind/shadcn styles** — [preview.tsx](.storybook/preview.tsx) never imported `globals.css`. Added the import; verified the compiled output now contains your shadcn oklch tokens.
2. **Broken font variable** — [globals.css](src/app/globals.css) had `--font-sans: var(--font-sans)` (self-referencing, so it silently resolved to nothing). Fixed to point at `--font-geist-sans`, which is what `layout.tsx` actually sets.
3. **Deleted Storybook's default boilerplate** (`src/stories/*` — the example Button/Header/Page stories and assets), per instructions.md step 13.
4. **`npm test` was broken** — the script didn't exist, but Husky's pre-commit hook runs `npm test` on every commit, so every commit was silently failing. Added `"test": "vitest run --passWithNoTests"` (the `--passWithNoTests` flag matters right now since you have zero stories/tests yet — without it, the empty suite exits non-zero and still blocks commits).
5. **Added the missing unit-test Vitest project** (jsdom, `src/**/*.test.{ts,tsx}`) alongside the existing Storybook browser-test project, plus a `vitest.setup.ts` wiring in `@testing-library/jest-dom` matchers — per instructions.md step 15.
6. **Removed i18n** per your note: uninstalled `next-intl`, deleted the empty `src/i18n/request.ts` and `messages/en.json` (it was only partially wired in anyway — nothing referenced it elsewhere).
7. Added `.github/pull_request_template.md` and `.github/workflows/ci.yml` (lint/typecheck/vitest/build-storybook + a Chromatic job), and filled in the placeholder `README.md` — steps 20, 22, 25.

## Left for you (need your accounts/credentials, so I didn't touch them)
- No git remote is configured yet — create the GitHub repo and push when ready.
- Chromatic: sign up, link the repo, add `CHROMATIC_PROJECT_TOKEN` as a repo secret (the CI job is already written for it).
- Branch protection on `main` (needs the CI to run once first).
- ADRs `0002` (Playwright vs Cypress) and `0003` (App Router), plus the Base UI vs Radix/React Aria decision — instructions.md is clear these should capture *your* reasoning, so I left them for you rather than fabricating them. `docs/adr/template.md` is ready to copy.

One more thing worth flagging: `git status` shows a large pre-existing staged-but-uncommitted changeset (basically your whole setup beyond the initial `create-next-app` commit) — I didn't commit anything, that's still sitting there for you to review and commit yourself.

You're ready to run `npm run dev` and `npm run storybook` and start building components.

---

Yes, you should use a changelog, but because you are running a strict, professional-grade engineering setup (Conventional Commits, CI/CD pipelines, Chromatic), you should never write it manually.
Instead, you should automate it using your commit history.
------------------------------
## Why You Need a Changelog (The "Why")

* Audit Trail for Architecture: As a solo developer or small team, a changelog acts as a scannable ledger of your engineering decisions. It maps exactly when features, styling foundations, or breaking changes were introduced.
* Release Boundary Markers: It shifts your mindset from "pushing code to main" to "shipping a versioned product." This is a key requirement for proving high-level architecture and release strategy.
* Simplifies Code Reviews: Looking back at a project after two weeks, a changelog tells you exactly what changed without forcing you to dig through a messy Git history.

------------------------------
## Why Manual Changelogs Fail (The "Why Not")

* Human Error: You will forget to update it.
* Wasted Velocity: Writing down list items that already exist in your Git logs is redundant, anti-automation work.
* Format Drift: Manual logs quickly lose consistency in formatting, dates, and semantic categorization.

------------------------------
## The Professional Solution: Automated Semantic Releases
Because your Stage 0 setup enforces Conventional Commits (feat:, fix:, chore:), you can leverage tooling to automatically generate a CHANGELOG.md file and handle project versioning for you.
When your GitHub Actions pipeline runs on a merge to main, a tool like Changesets or Semantic Release reads your commit tags and does three things automatically:

   1. Calculates the next version based on semantic rules (e.g., a feat: triggers a minor version bump like 1.1.0).
   2. Creates a clean, grouped CHANGELOG.md sorting features from bug fixes.
   3. Creates a tagged GitHub Release.

## Direct Comparison: Changelog Strategies

| Strategy | Developer Effort | Consistency | Recommended for this Project? |
|---|---|---|---|
| Manual Editing | High 😫 | Low ❌ | No. Breaks automation principles. |
| No Changelog | None 🧊 | None ❌ | No. Lowers project presentation value. |
| Automated Tooling | Zero (Once set up) ⚡ | Perfect 🏆 | Yes. Proves production-grade CI/CD maturity. |

Would you like to see how to install and configure a tool like Changesets in your local environment so your workflow stays fully automated?

You hit the nail on the head—this is exactly how production engineering teams handle this trade-off.
Your instinct is 100% correct: if you push every tiny "typo fix" or "wip" commit directly into a changelog, it becomes noisy and unreadable. You absolutely should have the freedom to commit 50 times a day while working locally.
The secret to clean automation lies in Squash Merging on Pull Requests.
------------------------------
## The Workflow: Messy Locally, Clean on Main
You do not change your local habit. You commit as much as you want. The cleanup happens at the Pull Request boundary when you merge into main.

Local Branch (Feature Work)          Pull Request Boundary          Main Branch (Changelog)
┌───────────────────────────┐                                       ┌───────────────────────────┐
│ chore: start card         │                                       │                           │
│ fix: typo                 │ ───►  [ SQUASH & MERGE ]  ──────────► │ feat: add MovieCard...    │
│ wip: styles broken        │       Combine 4 commits into 1        │                           │
│ feat: complete component  │       with a perfect message.          │                           │
└───────────────────────────┘                                       └───────────────────────────┘


   1. Local Freedom: On your feature branch (e.g., feature/movie-card), you commit every 10 minutes if you want. Don't worry about Conventional Commits here. Write whatever you want.
   2. The Squash Merge: When your branch is ready, you open a Pull Request to main. When you click Squash and Merge on GitHub, it collapses those 4 or 5 messy local commits into one single commit.
   3. The Final Message: GitHub asks you to name this single combined commit. This is where you write your perfect Conventional Commit message (e.g., feat: add MovieCard component with responsive design).
   4. The Clean Result: Only that one, beautifully written squash commit touches your main branch history. Your automated tool reads only that clean main history, giving you a perfect, high-level changelog.

------------------------------
## How to Enforce This in Your Repository
You can configure GitHub to completely block messy history from hitting your main branch.

   1. Go to your GitHub Repository Settings.
   2. Under the General tab, scroll down to the Pull Requests section.
   3. Uncheck "Allow merge commits" and "Allow rebase merging".
   4. Check "Allow squash merging".

By enforcing this option, your local development remains entirely unrestricted, your Git branch history on main remains perfectly structured, and your automated changelogs stay incredibly clean.
Would you like to move on to setting up your Design Tokens (Stage 1), or do you want to finalize the automated GitHub Actions script for this PR-based workflow first?

Your instinct is completely normal—when you are working solo, the concept of a Pull Request (PR) feels redundant because you are essentially reviewing your own work.
However, in professional software engineering, a Pull Request is not just a social tool for code reviews; it is an automation checkpoint. It is the specific trigger that tells your automated systems (like GitHub Actions, Vitest, and Chromatic) to test your code before it breaks production.
Here is exactly how your Git flow should look, why PRs matter for solo developers, and how the changelog fits in.
------------------------------
## 1. The Solo Git Flow Step-by-Step
You should use a Feature Branch Workflow. You never write code directly on main. Instead, follow this exact loop:

  main  ───────────────────[PR 1: SQUASH & MERGE]──────────► (Automated Release / Changelog)
          \                                     /
   feat    └───► (Commit 1) ──► (Commit 2) ────┘


   1. Start on main: Ensure your local copy is up to date: git checkout main then git pull.
   2. Cut a branch: Create a new branch for a specific task: git checkout -b feat/movie-card.
   3. Work with total freedom: Write code, experiment, and commit as often as you like on this branch. Your commit messages here can be messy (git commit -m "wip broken styles", git commit -m "fixed typo").
   4. Push to GitHub: When the component is complete, push your branch online: git push origin feat/movie-card.
   5. Open a Pull Request: Go to GitHub and open a PR from feat/movie-card into main.

------------------------------
## 2. PR vs. Direct Merge: What's the Difference for a Solo Dev?
If you are alone, the structural difference between a PR and a direct merge comes down to safety and automation control.

| Action | What happens under the hood | Impact on your project |
|---|---|---|
| Direct Merge (git merge main) | You force your local code straight into the main history on your machine and push it up. | Dangerous. If you broke a type definition or a unit test, it hits production immediately. No automation checked it first. |
| Pull Request (via GitHub) | You request that your branch be merged into main. GitHub holds the gate closed until your automated pipelines run. | Professional. Your CI pipeline wakes up and automatically runs your linter, typechecker, Vitest unit tests, and Chromatic visual reviews on the cloud. |

By using a PR, you act as the Project Manager reviewing the Developer's work. If your GitHub Actions pipeline turns Red, you know your branch is broken, and you fix it on your branch before it ever touches your clean main branch. If it turns Green, you are safe to merge.
------------------------------
## 3. How the Changelog Handles the Merge
When your PR is green and you are ready to merge it on GitHub, you use the Squash and Merge button we discussed.

   1. GitHub collapses your 15 messy local commits into one clean commit.
   2. GitHub opens a text box and asks you to name this single combined commit.
   3. You type your perfect Conventional Commit message: feat: add movie card component with responsive layout.
   4. Click merge.

Now, your main branch has exactly one new commit added to it. Your automated changelog tool watches the main branch. It sees feat: add movie card..., grabs that text, automatically appends it to your CHANGELOG.md file, increments your project version (e.g., from 1.0.0 to 1.1.0), and publishes the update. Your messy local history is safely discarded, leaving your project looking immaculate.
To tailor how we set this up, choose one of the options below:

For a first-time user, Changesets is highly recommended. It is incredibly developer-friendly, visual, interactive, and doesn't require complex configurations or strict tokens to work locally.
Here is how your flow will look with Changesets + Squash Merging:

   1. You work on your feature branch (feat/movie-card) and commit as much as you want.
   2. Before opening your PR, you run npx changeset in your terminal.
   3. An interactive CLI asks you: "Is this a major, minor, or patch change?" and "What did you change?"
   4. It generates a small Markdown file tracking your change. You commit this file to your branch and open your PR.
   5. When you Squash and Merge the PR into main, that Markdown file is merged too.
   6. A GitHub Action automatically consumes those files and updates your CHANGELOG.md for you!

Let's get this fully configured so your workflow is ready to roll.
## Step 1: Initialize Changesets Locally
Run the following command in your project root terminal to install and set up the foundation:

# Install the core CLI tool
npm i -D @changesets/cli
# Initialize the changesets configuration folder
npx changeset init

This creates a .changeset/config.json file in your repository.
------------------------------
## Step 2: Configure the Release Workflow (GitHub Action)
To automate the changelog and release generation on GitHub, we need a workflow file. Create a new file at .github/workflows/release.yml and add the following configuration:

name: Release
on:
  push:
    branches:
      - main
concurrency: ${{ github.workflow }}-${{ github.ref }}
jobs:
  release:
    name: Release & Changelog
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Create Release Pull Request or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          # This automatically squashes changesets into CHANGELOG.md
          version: npx changeset version
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

------------------------------
## Step 3: Set Your Package to Private
Since this is an application rather than an open-source library you are publishing to npm, open your root package.json and ensure it is marked as private so the tool doesn't try to upload your code to the web:

{
  "name": "wanna-watch",
  "version": "0.1.0",
  "private": true,
  ...
}

------------------------------
## How to use this on your first feature branch:
When you are done building your first component on your branch, run:

npx changeset

Follow the prompts to describe your feature, commit the tiny generated .md file, and push your code to your PR!
Would you like to build out the design tokens syntax in src/styles/tokens.css (Stage 1) next, or should we configure your regular Lint/Typecheck/Test CI pipeline file for your PRs?

