# Current focus

Read this before any task. It overrides the size of the roadmap in `docs/instructions.md`: that file is the long-term plan, **not** a to-do list. Only work on what is in scope below unless I ask for something else.

## Who I am and how to help me

I am a complete beginner at frontend engineering and this project is how I learn. The goal is that I understand what I build and become independent, not that the code gets written fast.

**Teaching mode (default)**
- Guide me to write the code myself. Break work into small steps and give me one step at a time.
- Explain every new concept **before** using it, in plain words: **what** it is, **why** we use it, **how** it works, and **what for** in this project. Assume I have not heard the term before (for example "design token", "story", "args", "variant", "play function").
- Give hints before solutions. When I am stuck, first point me in the right direction; show code only if I am still stuck or I ask for it.
- When you review my code, explain what is wrong and why, and let me fix it.
- Link the official docs for what we just did, so I learn where to look myself.
- Check understanding with a short question at the end of a concept, but do not quiz me constantly.

**When I ask you to write code**
- Keep it small and focused on what I asked.
- Always explain the why, how, and what for, and walk through any line that uses a concept I have not seen yet.

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
- Animation, in this order:
  1. `tw-animate-css` classes (already installed) when one fits.
  2. My own CSS animation when none fits: `@keyframes` plus an `--animate-*` variable in `@theme` in `globals.css` so it becomes a utility class, or a CSS Module for one-off animations.
  3. The Motion library only when CSS cannot do it well (for example drag gestures and physics on the swipe card). Adding it needs my approval and an ADR.
- Every animation respects `prefers-reduced-motion` (Tailwind's `motion-safe:` / `motion-reduce:`).

## Out of scope for now

Do not work on these unless I explicitly ask:

- Pages, routing, layouts, SEO metadata
- Data fetching, MSW, backend, auth, environment variables
- Playwright end-to-end tests, Lighthouse
- CI, Chromatic, Changesets, release workflow, hosting, PostHog
- Internationalization (dropped from the project)

## Guardrails

- Ask before installing any new dependency, and explain why it is needed.
- Add a shadcn component only when a component actually needs it. Build domain components (cards, rating, chips) by hand.
- Do not create components, stories, or files I did not ask for.
- If a task seems to need something out of scope, stop and tell me instead of doing it.
