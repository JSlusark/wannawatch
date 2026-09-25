import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: { // these are props that can be passed in the component
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
        pill: "rounded-full bg-pink-500 text-primary-foreground hover:bg-primary/80 ", // i added this
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: { // this is the fallback if variant or size is not passed in a prop
      variant: "default",
      size: "default",
    },
  }
)
/* 
Component function, 
*/
function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }


/* 

Almost. You've got the core idea. Let's make the words a bit more precise, because "class" means two different things here.

**What you're actually doing in Storybook:** you **choose props**, and Storybook **renders the Button** with them. That's all. Storybook doesn't build anything itself; it's like writing `<Button variant="outline">` in a page, except in a place where you can see each version on its own.

**Who turns props into CSS classes? The `Button` component:**

```
Story args          { variant: "outline", size: "sm" }
      │
      ▼
Button (a function)  receives them as props
      │
      ▼
buttonVariants({ variant: "outline", size: "sm" })
      │   looks up the matching strings in cva's lists
      ▼
className = "…base classes… border-border bg-background … h-7 px-2.5 …"
      │
      ▼
<button class="…">  → Tailwind turns those classes into styles
```

**Two meanings of "class":**
- **CSS class** (`className`): the Tailwind strings like `bg-primary h-8`. `buttonVariants` produces these.
- A JavaScript **`class`**: a different thing (the `class` keyword). Your `Button` isn't one; it's a plain **function** that returns HTML. That's what a React component is.

So a more precise version of your sentence:

> "In Storybook I render the Button with specific **props**. The Button passes `variant` and `size` to `buttonVariants`, which picks the matching **CSS classes**."

This is also why this setup is nice: the list in `buttonVariants` is the **single source of truth**. Add a new variant there, and TypeScript automatically allows it in your stories and everywhere else you use `<Button>`.

**Quick check:** if you wrote `args: { variant: 'big' }`, what would happen, and who would tell you?


*/