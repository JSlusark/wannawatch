Context: new Next.js App Router project, need for fast styling plus room for custom CSS, Server Components compatibility.
Options: Tailwind, CSS Modules only, CSS-in-JS (Emotion).
Decision: Tailwind v4 as default; CSS Modules with @reference for animations and complex selectors; tokens in @theme; shadcn/ui selectively for interaction primitives, restyled.
Consequences: zero runtime CSS, works with Server Components; long class strings (handled with cn() and class-variance-authority); rule needed on when to use a CSS Module.
Why not Emotion: runtime CSS-in-JS forces client components in the App Router.