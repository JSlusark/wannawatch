import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border-2 border-border px-2 py-0.5 font-mono text-xs font-bold tracking-wide whitespace-nowrap uppercase focus-visible:ring-3 focus-visible:ring-ring has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-white dark:text-ink",
        outline: "bg-card text-card-foreground [a]:hover:bg-muted",
        ghost: "border-transparent hover:bg-muted",
        link: "border-transparent text-foreground underline decoration-secondary decoration-2 underline-offset-4",
        // Soft tints: same in light and dark, always ink text
        "soft-lime": "bg-lime-soft text-ink",
        "soft-purple": "bg-purple-soft text-ink",
        "soft-orange": "bg-orange-soft text-ink",
        "soft-pink": "bg-pink-soft text-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
