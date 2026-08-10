import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
};

export const Avatar = forwardRef<HTMLImageElement, AvatarProps>(
  ({ className, fallback, size = "md", src, ...props }, ref) => (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100",
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <img
          ref={ref}
          src={src}
          alt={props.alt ?? "avatar"}
          className="h-full w-full object-cover"
          {...props}
        />
      ) : (
        <span className="text-xs font-semibold text-gray-600">
          {fallback ?? "??"}
        </span>
      )}
    </div>
  )
);
Avatar.displayName = "Avatar";
