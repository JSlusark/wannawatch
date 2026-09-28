# Design direction: neobrutalism

Reference: Techgroove rebrand, Aura Bora shop, and the
[Neobrutalism UI how-to](https://dribbble.com/shots/20764973-Neobrutalism-UI-How-to).
More sources: [Sepideh Yazdi on Medium](https://medium.com/@sepidy/how-can-i-design-in-the-neo-brutalism-style-d85c458042de),
[Alpha Efficiency](https://alphaefficiency.com/neo-brutalism-web-design),
[Design Studio UIUX](https://www.designstudiouiux.com/blog/what-is-neubrutalism-web-design-trend/),
[HubSpot](https://blog.hubspot.com/website/neo-brutalism), and Pinterest boards.
[neobrutalism.dev](https://www.neobrutalism.dev/) is a shadcn + Tailwind v4 component library in this style
(github.com/ekmas/neobrutalism-components): look at it before hand-building components, but ask before installing.

Every component and review is checked against this page. Tokens live in `src/app/globals.css`
and are shown in Storybook under `Foundations/Tokens`.

## The rules

1. **Flat colour only.** No gradients, no blur, no glow, no glassmorphism. One exception: the dark fade behind text on movie posters (`PosterFade`), because text must stay readable on any picture.
2. **Pitch-black outlines.** `border-2 border-border` by default, `border-3` for cards. Ink is `#0b0b0f`.
3. **Hard shadows.** `shadow-brutal-sm` / `shadow-brutal` / `shadow-brutal-lg`: offset X and Y, zero blur, 100% opaque. Never `shadow-md` and friends.
4. **Colour + tint pairs.** A saturated fill (`lime`, `purple`, `orange`, `pink`) with a `-soft` tint for the secondary bar, chip or hover.
5. **Text on colour is ink** (white only on purple). Never neon text on a light background.
6. **Warm neutral base.** Cream (`#fffdf5`) in light, near-black (`#15151b`) in dark. Not pure white/black. Dark mode swaps outlines and hard shadows to cream.
7. **Two type voices.** `font-display` (Archivo Black) for headings, uppercase and large. `font-sans` (Public Sans) for body. `font-mono` for tiny uppercase labels.
8. **Raw shapes.** Rectangles, circles, stars, stickers with a stroke. Radius stays in the token scale (`rounded-lg` is the default).
9. **Interaction = the shadow moves.** Hover lifts (translate −1px, bigger shadow), press sinks (translate to the shadow, shadow shrinks to 0). Wrapped in `motion-safe:`.
10. **Every state exists:** default, hover, focus-visible, active, disabled, loading, empty, error.

## Pitfalls the sources warn about

- Subtle, light colours and soft shadows are an accessibility problem: keep contrast strong and hierarchy obvious.
- Unusual navigation and unclear controls raise cognitive load: stay conventional for buttons, forms and nav. Be wild in colour, shape and illustration, not in behaviour.
- Asymmetric layouts must still collapse cleanly on mobile.
- The style is trend-driven: keep everything in tokens so the look can be changed in one place.

## Anti-slop checklist (reject on sight)

- Purple-to-blue (or any) gradients, glassy blurred cards, soft `shadow-lg`.
- Emoji used as icons. Use one icon set (lucide) at a consistent stroke.
- Raw hex, arbitrary spacing (`p-[13px]`), or colours not from tokens.
- Everything centred, everything the same size: no hierarchy.
- Grey-on-grey low-contrast text; contrast below 4.5:1 for text, 3:1 for UI borders.
- Focus ring hidden by the thick border: the ring must stay clearly visible (`ring` token is purple in light, lime in dark).
- Animation that ignores `prefers-reduced-motion`.
- Generic "card with icon + title + paragraph" grids with no personality (add illustration, colour, a sticker).

## Review checklist

Hierarchy (one loudest thing per screen) · spacing rhythm (multiples of the spacing scale) ·
type scale · contrast · all states · keyboard · light and dark · a11y panel clean · reduced motion.
