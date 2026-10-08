# Learning notes

The concepts I have used so far while building WannaWatch, in plain words, with the official docs for each one.
Every topic answers: **what** it is, **why** we use it, and **where** it lives in this project.

> Tip: when you come back to a topic, open the doc link first and try to find the answer yourself before re-reading these notes.

## Table of contents

1. [Storybook](#1-storybook)
2. [Design tokens and Tailwind](#2-design-tokens-and-tailwind)
3. [shadcn/ui and Base UI](#3-shadcnui-and-base-ui)
4. [React concepts](#4-react-concepts)
5. [Semantic HTML and accessibility](#5-semantic-html-and-accessibility)
6. [3D card: tilt, flip and glare](#6-3d-card-tilt-flip-and-glare)
7. [Liquid rating](#7-liquid-rating)
8. [Animation and reduced motion](#8-animation-and-reduced-motion)
9. [Next.js Image](#9-nextjs-image)
10. [Doc links cheat sheet](#10-doc-links-cheat-sheet)

---

## 1. Storybook

**What:** a workshop where each component is shown on its own, outside the app, in every state it can be in.
**Why:** you can build and test a card without needing pages, data or login. It is also living documentation.

| Term | What it means | In this project |
| --- | --- | --- |
| **Story** | One saved state of a component (e.g. "Watched", "Missing poster") | `export const Watched: Story = { args: { watched: true } }` |
| **Meta** (default export) | Settings shared by all stories in a file: which component, default args, layout | `const meta = { component: MovieCard, args: {...} }` |
| **Args** | The props a story passes to the component | `args: { title: movie.title }` |
| **Controls** | The panel that lets you edit args live in the browser | generated from the args automatically |
| **`fn()`** | A fake function that records every call, so you can check it was called | `onToggleWatch: fn()` |
| **`render`** | A custom way to draw the story, e.g. with `useState` so buttons really toggle | the `Interactive` story |
| **`play` function** | A small automated test that clicks/types in the story and checks the result | clicks "Bookmarked" and expects `aria-pressed="true"` |
| **a11y panel** | Runs axe checks and lists accessibility problems | tab under the story |
| **autodocs** | Auto-generated docs page from the component's props and stories | `tags: ["autodocs"]` |

Docs:
- [What's a story](https://storybook.js.org/docs/writing-stories)
- [Args](https://storybook.js.org/docs/writing-stories/args)
- [Interaction tests / play functions](https://storybook.js.org/docs/writing-tests/interaction-testing)
- [Accessibility testing](https://storybook.js.org/docs/writing-tests/accessibility-testing)
- [Autodocs](https://storybook.js.org/docs/writing-docs/autodocs)

---

## 2. Design tokens and Tailwind

**Design token:** a named design decision (a colour, a shadow, a radius) stored in one place. Components use the name, never the raw value.
**Why:** change `--color-secondary` once and every button, pill and liquid updates. It also keeps light/dark mode consistent.

Where: `src/app/globals.css`

- **`@theme`**: tokens declared here become Tailwind classes automatically.
  `--color-on-media: #fff` → you can write `text-on-media`, `bg-on-media`, `fill-on-media`.
  `--shadow-hard` → `shadow-hard`. `--animate-wave` → `animate-wave`.
- **`@theme inline`**: same, but the token points at another CSS variable (`var(--primary)`) that changes in `.dark`. That is how dark mode works.
- **`:root` / `.dark`**: the actual light and dark values.
- **`@keyframes` inside `@theme`**: define an animation next to its token (see the `wave` animation).

Useful Tailwind ideas we used:

| Idea | Example | What it does |
| --- | --- | --- |
| Arbitrary values | `w-[200%]`, `bottom-[calc(100%-1px)]` | one-off value when no utility exists |
| Opacity modifier | `bg-secondary/10` | the token colour at 10% opacity |
| State variants | `hover:`, `focus-visible:`, `aria-pressed:` | style only in that state |
| `has-*` variant | `has-focus-visible:ring-3` | style the parent when a child matches (the label when its hidden radio is focused) |
| `sr-only` | `<span className="sr-only">IMDb rating</span>` | invisible on screen, still read by screen readers |
| `line-clamp-2` | on the title | cut long text to 2 lines with "…" |
| `isolate` | card faces | starts a new stacking layer so `-z-10` children stay inside the card |

**`cn()` + `class-variance-authority` (cva)**
- `cn()` joins class names and, when two Tailwind classes clash, keeps the **last** one. That is why passing `px-0` to `Badge` beats its built-in `px-2`.
- `cva()` describes variants (`variant: "outline" | "secondary"`) as a table of classes. See `src/components/ui/badge.tsx`.

**Colour contrast:** text must reach **4.5:1** against its background (WCAG AA). Check new colour pairs with a contrast checker.

Docs:
- [Tailwind theme variables (`@theme`)](https://tailwindcss.com/docs/theme)
- [Custom animations](https://tailwindcss.com/docs/animation#customizing-your-theme)
- [Hover, focus and other states](https://tailwindcss.com/docs/hover-focus-and-other-states)
- [cva](https://cva.style/docs)
- [WebAIM contrast checker](https://webaim.org/resources/contrastchecker/)

---

## 3. shadcn/ui and Base UI

**What:** shadcn is not a library you import from npm. It **copies** component source code into `src/components/ui/`, so you own it and can restyle it with your tokens.
Underneath, these components use **Base UI**: unstyled components that handle behaviour and accessibility (keyboard, ARIA) for you.

- `Toggle` (`ui/toggle.tsx`): a button that is on or off. It sets `aria-pressed` for you, so screen readers hear "Watched, toggle button, pressed".
- `Badge` (`ui/badge.tsx`): small label. Uses the **`render` prop** to change which HTML tag it outputs: `<Badge render={<li />}>` renders an `<li>` with badge styles, so the genres are a real list.

**Rule of thumb:** look for a shadcn component (or block) first, restyle it, and only hand-build what nothing covers.

Docs:
- [shadcn/ui](https://ui.shadcn.com/docs)
- [Base UI](https://base-ui.com/react/overview/quick-start)
- [Base UI `render` prop](https://base-ui.com/react/handbook/composition)

---

## 4. React concepts

| Concept | What / why | In the card |
| --- | --- | --- |
| **Props** | inputs to a component | `title`, `watched`, `rating` |
| **`useState`** | memory that survives re-renders; changing it re-draws the component | `flipped` (which side is showing) |
| **Controlled component** | the parent owns the value and passes it down; the child only reports changes through a callback | `watched` + `onToggleWatch`, `rating` + `onRate` |
| **`useRef`** | a box that points to a real DOM element (or keeps a value without re-rendering) | `frontRef`, `backRef` to move focus |
| **`useEffect`** | run code **after** React updates the screen, when something changed | move keyboard focus after the card flips |
| **`useId`** | generates an ID that is unique on the page, even with many cards | links the title to `aria-labelledby`; groups the radios with `name` |
| **Custom hook** | your own `use…` function that bundles state + logic for reuse | `useTilt()` |
| **Splitting components** | small named pieces inside a file are easier to read | `Poster`, `Genres`, `WatchedPill`, `RatingText` |
| **`"use client"`** | this component uses state/events, so it must run in the browser (Next.js) | top of `MovieCard.tsx` |
| **List `key`** | React needs a unique `key` per list item to track it | genres use the genre name (duplicates cause the warning in the `LongText` story) |

Docs:
- [useState](https://react.dev/reference/react/useState)
- [Sharing state / controlled components](https://react.dev/learn/sharing-state-between-components)
- [useRef](https://react.dev/reference/react/useRef)
- [useEffect](https://react.dev/reference/react/useEffect)
- [useId](https://react.dev/reference/react/useId)
- [Custom hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Keys](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key)
- [`"use client"`](https://nextjs.org/docs/app/getting-started/server-and-client-components)

---

## 5. Semantic HTML and accessibility

**Semantic HTML** = using the tag that *means* what the thing is. Browsers and screen readers then understand it for free.
**Rule:** use ARIA only when no HTML element does the job.

| We used | Instead of | Why |
| --- | --- | --- |
| `<article aria-labelledby={titleId}>` | `<div>` | a self-contained item, named by its title |
| `<ul>` + `<li>` for genres | spans | screen readers announce "list, 3 items" |
| `<button>` (via `Toggle`) | clickable `<div>` | focusable, Enter/Space work, announced as a button |
| `<fieldset>` + `<legend>` + `<input type="radio">` | custom divs with click handlers | arrow keys, "2 of 5" announcements and grouping all come for free |
| `<label>` around each radio | click handlers | clicking anywhere in the label checks its radio |

Other a11y tools we used:
- **`aria-hidden="true"`**: hide decorative or duplicate things from screen readers (icons, the white copy of the rating text).
- **`aria-pressed`**: on/off state of a toggle button (set by `Toggle`).
- **`inert`**: makes a whole area unclickable and unfocusable. The side of the card facing away is `inert`, so Tab never lands on hidden buttons.
- **Focus management**: after a flip, move focus to the side you can now see, otherwise keyboard users are "lost".
- **`focus-visible`**: show the focus ring only for keyboard users, not on mouse click.
- **Manual keyboard test**: Tab through the component, use Enter/Space/arrows, check you can always see where you are.

Docs:
- [MDN: HTML elements reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Element)
- [MDN: radio inputs](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio)
- [MDN: fieldset](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/fieldset)
- [MDN: `inert`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert)
- [MDN: aria-pressed](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-pressed)
- [First rule of ARIA](https://www.w3.org/TR/using-aria/#rule1)
- [WCAG quick reference](https://www.w3.org/WAI/WCAG22/quickref/)

---

## 6. 3D card: tilt, flip and glare

Three nested boxes, each with one job (see `MovieCard.tsx`):

1. **Outer box: `perspective-distant`**. Perspective is how far the "camera" is. Without it, 3D rotations look flat. It also listens to the mouse (it never moves, so tracking stays smooth).
2. **Tilt box**: `rotateX`/`rotateY` from the mouse position, plus a small `scale3d` grow.
3. **Flip box**: `rotate-y-180` when `flipped` is true. `transform-3d` (`transform-style: preserve-3d`) keeps the children in real 3D.

**Two faces in one spot:** both faces use `col-start-1 row-start-1` in a CSS grid, so they sit on top of each other and share the same size.
**`backface-hidden`**: hides a face when it is turned away. The back is pre-rotated 180°, so it faces you only after the flip.
**Pointer events**: `onPointerMove` gives the mouse position; `getBoundingClientRect()` tells where the card is, so we get the mouse position *inside* the card.
**Glare**: a `radial-gradient` whose centre follows the mouse. On the back, left and right are mirrored (`100 - x`).
**`e.pointerType !== "mouse"`**: tilt only for a mouse, since a finger has no hover.

Docs:
- [MDN: perspective](https://developer.mozilla.org/en-US/docs/Web/CSS/perspective)
- [MDN: transform-style](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-style)
- [MDN: backface-visibility](https://developer.mozilla.org/en-US/docs/Web/CSS/backface-visibility)
- [Tailwind: 3D transforms (rotate-y, perspective)](https://tailwindcss.com/docs/perspective)
- [MDN: Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
- [MDN: getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)
- [MDN: radial-gradient](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient)

---

## 7. Liquid rating

Where: `src/components/MovieCard/LiquidRating.tsx`

- **Five tap bands**: a radio group laid out with `flex flex-col`; each `<label>` is `flex-1`, so they split the card height evenly. The radios are hidden with `sr-only` but still work with the keyboard.
- **The liquid**: a `div` pinned to the bottom (`absolute bottom-0`) whose `height` is a percentage (20% … 100%). A CSS `transition` animates the height change.
- **The wave**: an SVG twice as wide as the card containing the same wave twice. The `wave` keyframes slide it left by 50%, then it starts again. Since both halves are identical, the loop looks endless.
  - `viewBox` + `preserveAspectRatio="none"` lets the SVG stretch to any size.
  - The path uses `Q` (a curve) and `T` (repeat the curve smoothly).
- **Fixed text that changes colour**: the text is drawn **twice** in exactly the same place:
  1. a dark copy on the card (the `<legend>`, which also names the radio group for screen readers),
  2. a white copy on top, cut with `clip-path: inset(X% 0 0 0)` so it only shows where the liquid is.
  As the liquid rises, the clip moves with it, and the letters turn white exactly where they are covered.
- **Stacking (`z-index`)**: the dark text uses `-z-10` so the liquid paints over it. `isolate` on the card face keeps it from falling behind the card background.

Docs:
- [MDN: CSS transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transitions/Using_CSS_transitions)
- [MDN: clip-path](https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path)
- [MDN: SVG paths (Q and T curves)](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths)
- [MDN: viewBox](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox)
- [MDN: stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context)
- [Reference effect: liquid button](https://www.shadcn.io/button/liquid-button)

---

## 8. Animation and reduced motion

- **Transition**: animate from one value to another when it changes (flip, liquid height, clip-path).
- **Keyframes / animation**: an animation that runs by itself, on a loop or once (the wave).
- **`prefers-reduced-motion`**: a user setting for people who get dizzy or distracted by motion. Every animation must respect it.
  - `motion-safe:` = only animate if the user did **not** ask for less motion.
  - `motion-reduce:` = special style when they **did** ask.
  - In JS: `window.matchMedia("(prefers-reduced-motion: reduce)")` (used to switch off the tilt).
- **Libraries**: `tw-animate-css` for simple enter/exit; a library such as Motion for gestures and physics (planned for the swipe card).

Docs:
- [MDN: animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [tw-animate-css](https://github.com/Wombosvideo/tw-animate-css)
- [Motion for React](https://motion.dev/docs/react)

---

## 9. Next.js Image

`<Image fill sizes="…" />` from `next/image`:
- **`fill`**: the image covers its parent (the parent needs `relative`/`absolute`), used with `object-cover` to crop instead of stretching.
- **`sizes`**: tells the browser how wide the image will be on screen, so it downloads a small enough file.
- **`alt=""`**: the poster is decorative here because the title is already text; an empty alt makes screen readers skip it.

Docs:
- [Next.js Image component](https://nextjs.org/docs/app/api-reference/components/image)
- [MDN: alt text decisions](https://www.w3.org/WAI/tutorials/images/decision-tree/)

---

## 10. Doc links cheat sheet

| Topic | Start here |
| --- | --- |
| HTML / CSS / browser APIs | [MDN Web Docs](https://developer.mozilla.org/) |
| React | [react.dev](https://react.dev/learn) |
| Next.js (this version: also `node_modules/next/dist/docs/`) | [nextjs.org/docs](https://nextjs.org/docs) |
| Tailwind | [tailwindcss.com/docs](https://tailwindcss.com/docs) |
| Storybook | [storybook.js.org/docs](https://storybook.js.org/docs) |
| shadcn/ui | [ui.shadcn.com](https://ui.shadcn.com/docs) |
| Base UI | [base-ui.com](https://base-ui.com/) |
| Accessibility | [WAI tutorials](https://www.w3.org/WAI/tutorials/), [WCAG quick ref](https://www.w3.org/WAI/WCAG22/quickref/) |
