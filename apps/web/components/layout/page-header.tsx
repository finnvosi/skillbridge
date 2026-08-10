import type { ReactNode } from "react";
import { FadeUp } from "@/components/motion";
import { cn } from "@/lib/utils";

/** Dashboard page header: eyebrow + title + subtitle + optional actions. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <FadeUp
      className={cn(
        "flex flex-wrap items-end justify-between gap-4 border-b border-gray-200 pb-6",
        className
      )}
    >
      <div>
        {eyebrow && <p className="label-mono">{eyebrow}</p>}
        <h1 className="display mt-2 text-3xl sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </FadeUp>
  );
}

/** Compact stat tile with an icon. */
export function StatCard({
  icon: Icon,
  label,
  value,
  accent = "text-primary",
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-5 shadow-soft",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10", accent)}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className={cn("display mt-3 text-3xl", accent)}>{value}</p>
    </div>
  );
}
