# Current focus

Read this before any task. It overrides the size of the roadmap in `docs/instructions.md`: that file is the long-term plan, **not** a to-do list. Only work on what is in scope below unless I ask for something else.

## Who I am and how to help me

I am a complete beginner at frontend engineering and this project is how I learn. The goal is that I understand what I build and become independent, not that the code gets written fast.

**Working mode**
- When I ask for a change ("fix", "change", "add", "make"), do the whole job yourself: edit the files, delete dead files, run the type check / lint, and check the result (e.g. screenshots of Storybook). Never hand me commands to run, steps to follow, exercises, or quiz questions.
- If a tool fails, retry it or find another way. If something truly cannot be done, say so plainly; don't turn it into a task for me.
- When I only ask a question or ask for a review, explain and don't touch files.
- After every change, explain what changed, why, and how it works, in plain words. Assume I have not heard the term before (for example "design token", "story", "variant", "container query").
- Link the official docs for what you used.
- Keep changes focused on what I asked.

## In scope now: design foundation and building components in Storybook

Suggested learning path, in order:

1. **Storybook basics** with the existing shadcn `Button` (`src/components/ui/button.tsx`): what a story is, args and controls, one story per state, the a11y panel, autodocs.
2. **Design tokens** in `@theme` in `src/app/globals.css`: colors (light and dark), spacing, typography, radius, focus ring. Check contrast (WCAG AA 4.5:1). Add a light/dark switch to the Storybook toolbar and a `Foundations/Tokens` MDX page.
3. **Movie data type and fixtures**: a typed `Movie` type and a few static JSON fixtures in `src/mocks/fixtures/` (including edge cases: long title, missing poster). Static data only, no API, no MSW.
4. **Components**, smallest first:
   1. Restyle `Button` with my tokens. **Before opening this PR, remind me to set up Changesets** and guide me through it (it is my first user-facing change, so it becomes the first changelog entry).
   2. `GenreChip` / `Badge`
   3. `ScoreRating` (−3 to +3 with a color fill bar)
   4. `MovieCard` with Wanna Watch and + Watched actions
   5. Card flip to the score card
   6. Filters and search
   7. `SwipeCard` for the Daily 10 (hardest, showcase piece)

**Loop for every component** (from `docs/instructions.md`, stage 2):
stories for every state first → semantic HTML (ARIA only where HTML has no equivalent) → zero a11y violations and a manual keyboard test → a `play` function for the main interaction → unit tests only for logic that is not rendering → autodocs and usage notes.

Folder per component: `src/components/ComponentName/` with the component, its stories, a test if there is logic, and `index.ts`. shadcn primitives stay in `src/components/ui/`.

## Styling and animation rules

- Tailwind utilities by default, with values from tokens, never raw values.
- `cn()` + `class-variance-authority` for variants.
- A CSS Module (with `@reference`) only for things awkward as utilities: complex selectors, detailed keyframes.
- Animation: use a library whenever one fits instead of writing it by hand. `tw-animate-css` (already installed) for simple enter/exit effects; a dedicated library such as Motion for anything more (flips, tilts, drag gestures, physics on the swipe card).
- Every animation respects `prefers-reduced-motion` (Tailwind's `motion-safe:` / `motion-reduce:`, or the library's reduced-motion option).

## Out of scope for now

Do not work on these unless I explicitly ask:

- Pages, routing, layouts, SEO metadata
- Data fetching, MSW, backend, auth, environment variables
- Playwright end-to-end tests, Lighthouse
- CI, Chromatic, Changesets, release workflow, hosting, PostHog
- Internationalization (dropped from the project)

## Guardrails

- Don't reinvent the wheel: if a well-maintained library already does something, use it. shadcn first for UI pieces, then other libraries (and 21st.dev / shadcn blocks for ready-made patterns). Only write by hand what no library covers. Restyle everything with my tokens.
- Before installing a new dependency, tell me which one and why, so I can say yes.
- Do not create components, stories, or files I did not ask for.
- If a task seems to need something out of scope, stop and tell me instead of doing it.
