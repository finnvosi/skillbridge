"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  ClipboardList,
  User,
  Briefcase,
  Search,
  Users,
  Building2,
  ShieldCheck,
  ListChecks,
  FileCheck2,
  LogOut,
  Menu,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { clearToken } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { ApiUser } from "@/lib/api-client";
import { useState, useRef } from "react";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/primitives2";

interface NavItem {
  label: string;
  href: string;
  roles: string[];
  icon: React.ComponentType<{ className?: string }>;
  section: "student" | "employer" | "admin";
}

const navItems: NavItem[] = [
  {
    label: "Opportunities",
    href: "/dashboard/employer",
    roles: ["employer"],
    icon: Briefcase,
    section: "employer",
  },
  {
    label: "Talent Search",
    href: "/dashboard/employer/talent",
    roles: ["employer"],
    icon: Search,
    section: "employer",
  },
  {
    label: "Applicants",
    href: "/dashboard/employer/applicants",
    roles: ["employer"],
    icon: Users,
    section: "employer",
  },
  {
    label: "Team",
    href: "/dashboard/employer/team",
    roles: ["employer"],
    icon: User,
    section: "employer",
  },
  {
    label: "Company",
    href: "/dashboard/employer/company",
    roles: ["employer"],
    icon: Building2,
    section: "employer",
  },
  {
    label: "Discover",
    href: "/dashboard/student/discover",
    roles: ["student"],
    icon: Compass,
    section: "student",
  },
  {
    label: "My Applications",
    href: "/dashboard/student/applications",
    roles: ["student"],
    icon: ClipboardList,
    section: "student",
  },
  {
    label: "Profile",
    href: "/dashboard/student/profile",
    roles: ["student"],
    icon: User,
    section: "student",
  },
  {
    label: "Overview",
    href: "/dashboard/admin",
    roles: ["admin"],
    icon: ShieldCheck,
    section: "admin",
  },
  {
    label: "Users",
    href: "/dashboard/admin/users",
    roles: ["admin"],
    icon: Users,
    section: "admin",
  },
  {
    label: "Opportunities",
    href: "/dashboard/admin/opportunities",
    roles: ["admin"],
    icon: ListChecks,
    section: "admin",
  },
  {
    label: "Applications",
    href: "/dashboard/admin/applications",
    roles: ["admin"],
    icon: FileCheck2,
    section: "admin",
  },
];

const SECTION_LABEL: Record<NavItem["section"], string> = {
  student: "Student",
  employer: "Employer",
  admin: "Admin",
};

export function DashboardShell({
  user,
  children,
}: {
  user: ApiUser | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduce = useReducedMotion();
  const navListRef = useRef<HTMLUListElement>(null);

  const items = navItems.filter(
    (i) => !user || i.roles.includes(user.role)
  );

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const logout = () => {
    clearToken();
    router.push("/auth/login");
  };

  /* hover-following pill indicator under nav links (spring-driven, not React state) */
  const hoverX = useMotionValue(0);
  const hoverW = useMotionValue(0);
  const px = useSpring(hoverX, { stiffness: 280, damping: 26 });
  const pw = useSpring(hoverW, { stiffness: 280, damping: 26 });

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      {/* ===== Floating editorial pill nav (fixed, not sticky) ===== */}
      <header className="fixed inset-x-0 top-4 z-40 pointer-events-none">
        <div className="flex justify-center px-3">
          <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-card-border/60 bg-white/80 px-4 py-2.5 shadow-soft-lg backdrop-blur-xl">
            {/* scroll progress (first child, rounded-full) */}
            <ScrollProgress className="rounded-full" />
            {/* purple logo tile */}
            <Link
              href="/"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary"
            >
              <Image
                src="/skillbridge-logo.svg"
                alt="SkillBridge"
                width={18}
                height={18}
                className="invert"
              />
            </Link>

            {/* nav links (center) */}
            <nav className="flex-1 overflow-x-auto">
              <ul
                ref={navListRef}
                className="relative flex items-center gap-1 px-2 py-1.5 text-sm"
              >
                {/* hover-following pill indicator */ }
                {!reduce && (
                  <motion.li
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-9 rounded-full bg-primary/10"
                    style={{ x: px, width: pw }}
                  />
                )}
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onMouseEnter={(e) => {
                          if (reduce || !navListRef.current) return;
                          const r = navListRef.current.getBoundingClientRect();
                          const c = (
                            e.currentTarget as HTMLElement
                          ).getBoundingClientRect();
                          hoverX.set(c.left - r.left + 6);
                          hoverW.set(c.width);
                        }}
                        onMouseLeave={() => {
                          if (reduce) return;
                          hoverX.set(0);
                          hoverW.set(0);
                        }}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "relative z-[2] flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                          active
                            ? "text-primary"
                            : "text-gray-600 hover:text-gray-900"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            active ? "text-primary" : "text-gray-500"
                          )}
                        />
                        {item.label}
                        {active && (
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-primary" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* user + CTA (right) */}
            <div className="flex items-center gap-1.5 pl-1.5 pr-1">
              {user && (
                <div className="hidden flex-col items-end sm:flex">
                  <p className="font-display text-sm font-bold text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              )}
              <Magnetic>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="group rounded-full text-gray-600 hover:text-primary"
                  title="Log out"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:ml-1 sm:inline">Log out</span>
                  <ArrowUpRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 opacity-0 group-hover:opacity-100" />
                </Button>
              </Magnetic>
            </div>
          </div>
        </div>
      </header>

      {/* page content — offset for fixed pill nav */}
      <main className="relative flex-1 pt-20 lg:pt-24 p-4 sm:p-8">
        {/* corner-lit field on wide screens */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 -z-10 h-[28rem] w-[28rem] -translate-y-20 translate-x-20 rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(60,9,108,0.14) 0%, rgba(60,9,108,0) 70%)",
          }}
        />
        {children}
      </main>
    </div>
  );
}
