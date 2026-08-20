import { BadgeCheck, Crosshair, Layers, type LucideIcon } from "lucide-react";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion";

type Pillar = {
  n: string;
  icon: LucideIcon;
  t: string;
  d: string;
};

const PILLARS: Pillar[] = [
  {
    n: "01",
    icon: BadgeCheck,
    t: "Verified by the people who matter",
    d: "Employers and educators attest the work. Every claim carries a signature, not a hope — so the record actually means something.",
  },
  {
    n: "02",
    icon: Crosshair,
    t: "Matched on ability, not keywords",
    d: "Opportunities surface by what you can actually do. The right work finds the right person instead of drowning in a wish-list filter.",
  },
  {
    n: "03",
    icon: Layers,
    t: "Portable for life",
    d: "Each completed project becomes a permanent record you own and can take anywhere. Proof that travels with you, long after the role ends.",
  },
];

/**
 * UVP — the one crisp statement of value, placed directly after the hero.
 * Distinct from StickySteps (process) and StickySwap (poetic manifesto): this
 * is the literal "what we are + why we're different" block, backed by three
 * concrete, scannable reasons. Editorial Swiss grid with hairline rules.
 */
export function Uvp() {
  return (
    <section
      id="uvp"
      aria-labelledby="uvp-title"
      className="relative overflow-hidden border-b border-gray-200 bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      {/* brand texture: layered purple + sky glow, very fine grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(124,58,237,0.07),transparent_30%),radial-gradient(circle_at_90%_92%,rgba(56,189,248,0.08),transparent_34%)]"
      />
      <div
        aria-hidden="true"
        className="bg-grain pointer-events-none absolute inset-0 opacity-[0.04]"
      />

      <div className="relative mx-auto max-w-7xl">
        <FadeUp>
          <p className="label-mono">003 — Why SkillBridge</p>
          <h2
            id="uvp-title"
            className="display mt-5 max-w-[18ch] text-5xl leading-[0.92] sm:text-6xl lg:text-7xl"
          >
            The proof is the profile.
            <br />
            <span className="text-gradient">Not the paper around it.</span>
          </h2>
          <p className="mt-7 max-w-[52ch] text-base leading-relaxed text-gray-600 sm:text-lg">
            SkillBridge connects students and employers on verified work — so
            what you can actually do is finally easier to see, review, and
            trust. No inflated claims. No lost portfolios. Just proof both
            sides can act on.
          </p>
        </FadeUp>

        {/* Editorial 3-column grid: hairline rules via gap-px on a tinted
            base. Reads as one Swiss structure, not three floating cards. */}
        <Stagger className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-[#E6E2F2] bg-[#E6E2F2] sm:mt-16 lg:grid-cols-3">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <StaggerItem
                key={pillar.n}
                as="article"
                className="group relative bg-white p-7 transition-colors duration-300 hover:bg-[#FAF9FE] sm:p-9"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/55">
                    {pillar.n}
                  </span>
                  <span className="h-px flex-1 bg-[#E6E2F2]" />
                  <Icon
                    className="h-5 w-5 text-primary"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-7 font-display text-2xl font-bold leading-tight tracking-[-0.02em] text-gray-900 sm:text-[1.75rem]">
                  {pillar.t}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-gray-600 sm:text-base">
                  {pillar.d}
                </p>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
