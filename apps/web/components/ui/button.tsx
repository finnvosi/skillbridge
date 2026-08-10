import type {
  ButtonHTMLAttributes,
  ReactElement,
  ReactNode,
} from "react";
import { cloneElement } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const sizeClasses = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

const variantClasses = {
  primary:
    "bg-primary text-primary-contrast hover:bg-primary-hover focus-visible:ring-primary",
  secondary:
    "bg-primary-light/10 text-primary hover:bg-primary-light/20 focus-visible:ring-primary",
  outline:
    "border border-primary text-primary hover:bg-primary/10 focus-visible:ring-primary",
  ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  asChild?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  asChild = false,
  ...props
}: ButtonProps) {
  const base = cn("btn", sizeClasses[size], variantClasses[variant], className);

  if (asChild) {
    const child = children as ReactElement<Record<string, unknown>>;
    const childClassName = (child.props as { className?: string })?.className;
    return cloneElement(child, {
      className: cn(base, childClassName),
    });
  }

  return (
    <button type="button" className={base} {...props}>
      {children}
    </button>
  );
}
