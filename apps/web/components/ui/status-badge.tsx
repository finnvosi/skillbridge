import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/lib/types";

const statusConfig: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Submitted",
    className: "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200",
  },
  reviewing: {
    label: "Reviewing",
    className: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  },
  shortlisted: {
    label: "Shortlisted",
    className: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",
  },
  accepted: {
    label: "Accepted",
    className: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
  },
  hired: {
    label: "Hired",
    className:
      "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  },
  withdrawn: {
    label: "Withdrawn",
    className: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  },
};

export interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = statusConfig[status] ?? {
    label: "Application update",
    className: "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        cfg.className,
        className,
      )}
    >
      {cfg.label}
    </span>
  );
}
