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
        "flex flex-wrap items-end justify-between gap-4 border-b border-card-border pb-6",
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

PageHeader.defaultProps = { eyebrow: "", subtitle: "" };

/** Section header: mono eyebrow + display title + optional action. */
export function SectionHeader({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-5 flex items-baseline justify-between gap-3 border-b border-card-border pb-2",
        className
      )}
    >
      <div>
        {eyebrow && (
          <p className="label-mono text-xs uppercase tracking-[0.18em] text-gray-500">
            {eyebrow}
          </p>
        )}
        <h2 className="display mt-1 text-2xl font-extrabold text-gray-900">
          {title}
        </h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/** Compact stat tile with corner-lit glow + frosted glass depth. */
export function StatCard({
  icon: Icon,
  label,
  value,
  accent = "text-primary",
  iconBg = "bg-primary/10",
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
  accent?: string;
  iconBg?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-card-border bg-white/60 p-5 shadow-soft backdrop-blur-xl transition-all duration-300 hover:shadow-soft-lg",
        className
      )}
    >
      {/* corner-lit radial */}{" "}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-14 -right-14 h-32 w-32 rounded-full opacity-0 group-hover:opacity-60"
        style={{
          background:
            "radial-gradient(circle, rgba(60,9,108,0.18) 0%, rgba(60,9,108,0) 70%)",
        }}
      />
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          iconBg,
          accent
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className={cn("display mt-0.5 text-2xl sm:text-3xl", accent)}>{value}</p>
      </div>
    </div>
  );
}
