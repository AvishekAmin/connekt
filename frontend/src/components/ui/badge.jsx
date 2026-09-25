import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "cn";
import { Slot } from "radix-ui";

const badgeVariants = cva(
  "group/badge inline-flex h-auto w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-black font-semibold",
        secondary: "bg-[#1a1a1a] text-white border border-white/10",
        destructive: "bg-red-500/10 text-red-400 border border-red-500/20",
        outline: "border-white/10 text-slate-300 bg-[#141414]",
        completed: "bg-emerald-500/10 text-[#00E599] border border-[#00E599]/30",
        paid: "bg-emerald-500/10 text-[#00E599] border border-[#00E599]/30",
        cyan: "bg-cyan-500/10 text-[#00D8F6] border border-[#00D8F6]/30",
        ghost: "hover:bg-[#1f1f1f] text-slate-300",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({ className, variant = "default", asChild = false, ...props }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
