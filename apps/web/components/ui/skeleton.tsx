import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      ref={ref}
      {...props}
    />
  ),
);
Skeleton.displayName = "Skeleton";

export { Skeleton };