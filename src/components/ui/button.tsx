import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Neobrutalism: flat fill, 2px outline, hard shadow. Hover lifts, press sinks into the shadow.
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border-2 border-border font-bold tracking-wide whitespace-nowrap uppercase shadow-brutal-sm outline-none select-none motion-safe:transition-[transform,box-shadow] motion-safe:duration-100 hover:-translate-y-0.5 hover:shadow-brutal focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "bg-card text-card-foreground",
        destructive: "bg-destructive text-white dark:text-ink",
        // No box: just a text button that stays flat
        ghost:
          "border-transparent bg-transparent text-foreground shadow-none hover:translate-y-0 hover:bg-muted hover:shadow-none active:translate-x-0 active:translate-y-0",
        link: "border-transparent bg-transparent text-foreground normal-case underline decoration-secondary decoration-2 underline-offset-4 shadow-none hover:translate-y-0 hover:shadow-none active:translate-x-0 active:translate-y-0",
      },
      size: {
        default:
          "h-10 px-4 text-sm in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 rounded-md px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 px-3 text-xs",
        lg: "h-12 px-6 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-10",
        "icon-xs": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
