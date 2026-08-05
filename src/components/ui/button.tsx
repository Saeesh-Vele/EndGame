import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-transparent text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-forest text-white hover:bg-forest-light active:bg-forest-dark shadow-xs",
        outline:
          "border-border bg-background text-charcoal hover:bg-sandstone hover:text-charcoal active:bg-pebble shadow-xs",
        secondary:
          "bg-sandstone text-charcoal border border-pebble hover:bg-pebble active:bg-pebble/80",
        ghost:
          "bg-transparent text-charcoal hover:bg-sandstone/60 hover:text-charcoal active:bg-sandstone",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/80 shadow-xs focus-visible:ring-destructive",
        link: "text-forest underline-offset-4 hover:underline p-0 h-auto min-h-0",
      },
      size: {
        default: "h-11 min-h-[44px] px-5 py-2.5 text-sm",
        xs: "h-8 min-h-[32px] px-3 text-xs rounded-lg [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 min-h-[36px] px-4 text-xs rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-13 min-h-[52px] px-7 text-base rounded-xl [&_svg:not([class*='size-'])]:size-5",
        icon: "size-11 min-h-[44px] min-w-[44px] p-0",
        "icon-xs": "size-8 min-h-[32px] min-w-[32px] p-0 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 min-h-[36px] min-w-[36px] p-0 rounded-lg",
        "icon-lg": "size-13 min-h-[52px] min-w-[52px] p-0 rounded-xl",
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
  loading = false,
  disabled,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={16} />}
      <Slot.Slottable>{children}</Slot.Slottable>
    </Comp>
  )
}

export { Button, buttonVariants }

