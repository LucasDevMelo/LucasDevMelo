import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[1.1em] [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-navy-900 text-cream-50 shadow-soft hover:bg-navy-800 hover:shadow-lifted active:scale-[0.98]",
        gold: "bg-gold-500 text-navy-950 shadow-soft hover:bg-gold-300 active:scale-[0.98]",
        outline:
          "border border-navy-900/15 bg-white text-navy-900 hover:border-navy-900/30 hover:bg-marian-50",
        ghost: "text-navy-900 hover:bg-navy-900/5",
        link: "text-marian-600 underline-offset-4 hover:underline px-0",
        danger: "bg-red-700 text-white hover:bg-red-800",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-[15px]",
        lg: "h-14 px-7 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild, type, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...(!asChild && { type: type ?? "button" })}
      {...props}
    />
  );
}
