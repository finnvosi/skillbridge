import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "primary" | "secondary" | "outline" | "neutral";
export type BadgeSize = "sm" | "md";

const variantClasses = {
  primary: "bg-primary/10 text-primary ring-1 ring-inset ring-primary/15",
  secondary: "bg-primary-light/15 text-primary-hover ring-1 ring-inset ring-primary-light/20",
  outline: "border border-primary/40 text-primary",
  neutral: "bg-gray-100 text-gray-700",
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "neutral", size = "md", children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
);
Badge.displayName = "Badge";
