import Link from "next/link";

const columns = [
  {
    title: "Platform",
    links: [
      { label: "For Students", href: "/#students" },
      { label: "For Employers", href: "/#employers" },
      { label: "How it works", href: "/#how" },
      { label: "Opportunities", href: "/auth/register" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#" },
      { label: "Careers", href: "/#" },
      { label: "Manifesto", href: "/#trust" },
      { label: "Contact", href: "/#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/#" },
      { label: "Terms", href: "/#" },
      { label: "Verification Policy", href: "/#trust" },
      { label: "Security", href: "/#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-auto border-t border-gray-200 bg-white/70">
      <div className="bg-grain absolute inset-0 -z-10 opacity-60" />
      <div className="glow-purple absolute inset-x-0 top-0 -z-10 h-40 opacity-50" />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          {/* Brand block — spans 5 cols */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5">
              <span className="font-display text-2xl font-extrabold tracking-tight text-gray-900">
                Skill<span className="text-primary">Bridge</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-600">
              Cambodia&apos;s verified talent network. We connect students to
              real work and give employers proof — not paper.
            </p>
            <p className="label-mono-muted mt-6">Phnom Penh · Est. 2026</p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title} className="md:col-span-2">
              <h4 className="label-mono-muted">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-gray-700 transition-colors hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* CTA block */}
          <div className="md:col-span-1">
            <h4 className="label-mono-muted">Get in</h4>
            <Link
              href="/auth/register"
              className="mt-4 inline-block font-display text-lg font-bold text-primary underline-offset-4 hover:underline"
            >
              Start free →
            </Link>
          </div>
        </div>

        <div className="rule mt-12 flex flex-col items-start justify-between gap-4 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} SkillBridge. A TradeLink Technologies
            venture.
          </p>
          <p className="label-mono-muted">
            Built in Cambodia · Verified by proof
          </p>
        </div>
      </div>
    </footer>
  );
}
