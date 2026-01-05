import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-eco-soft hover:shadow-neon hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border-2 border-primary/30 bg-transparent text-primary hover:bg-primary/10 hover:border-primary/60",
        secondary:
          "bg-secondary/20 text-secondary border border-secondary/40 hover:bg-secondary/30 hover:border-secondary/60",
        ghost: 
          "text-foreground hover:bg-primary/10 hover:text-primary",
        link: 
          "text-primary underline-offset-4 hover:underline",
        eco: 
          "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-eco-soft hover:shadow-neon-lg hover:scale-[1.02] active:scale-[0.98]",
        hero:
          "bg-gradient-to-r from-primary via-secondary to-electric text-primary-foreground shadow-lg hover:shadow-neon-lg hover:scale-[1.03] active:scale-[0.98] text-base font-bold",
        "hero-outline":
          "border-2 border-primary text-primary bg-primary/10 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground text-base font-bold",
        glass:
          "bg-card/60 backdrop-blur-xl border border-primary/20 text-foreground hover:bg-card/80 hover:border-primary/40 shadow-glass",
        success:
          "bg-success text-success-foreground hover:bg-success/90 shadow-sm",
        accent:
          "bg-gradient-to-r from-accent to-golden text-accent-foreground shadow-eco-soft hover:shadow-eco-glow hover:scale-[1.02]",
        neon:
          "bg-transparent border-2 border-electric text-electric hover:bg-electric/10 hover:shadow-neon animate-neon-pulse",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
