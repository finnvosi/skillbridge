import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/lib/types";

const statusConfig: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Submitted",
    className: "bg-gray-100 text-gray-700",
  },
  accepted: {
    label: "Accepted",
    className: "bg-green-100 text-green-800",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800",
  },
  withdrawn: {
    label: "Withdrawn",
    className: "bg-amber-100 text-amber-800",
  },
};

export interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        cfg.className,
        className
      )}
    >
      {cfg.label}
    </span>
  );
}
