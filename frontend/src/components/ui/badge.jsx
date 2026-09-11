import * as React from "react"
import { cva } from "class-variance-authority";
import { cn } from "cn"
import { Slot } from "radix-ui"

const badgeVariants = cva(
  "group/badge inline-flex h-auto w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-black font-semibold",
        secondary:
          "bg-[#131D36] text-white border border-[#1E2B4D]",
        destructive:
          "bg-red-500/10 text-red-400 border border-red-500/20",
        outline:
          "border-[#1E2B4D] text-slate-300 bg-[#0D1527]",
        completed:
          "bg-[#052E16] text-[#00E599] border border-[#00E599]/30",
        paid:
          "bg-[#052E16] text-[#00E599] border border-[#00E599]/30",
        cyan:
          "bg-[#062436] text-[#00D8F6] border border-[#00D8F6]/30",
        ghost:
          "hover:bg-[#131D36] text-slate-300",
        link: "text-primary underline-offset-4 hover:underline",
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
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
