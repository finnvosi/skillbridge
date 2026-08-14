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
} from "lucide-react";
import { clearToken } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { ApiUser } from "@/lib/api-client";
import { useState } from "react";

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

  const items = navItems.filter(
    (i) => !user || i.roles.includes(user.role)
  );

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const logout = () => {
    clearToken();
    router.push("/auth/login");
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      {/* ===== Top header bar — always-visible, scrollable row ===== */}
      <header className="relative z-30 flex h-16 shrink-0 items-center gap-3 border-b border-card-border bg-white/60 px-3 backdrop-blur-xl md:px-4">
        {/* subtle corner-lit glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-3 w-40 rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(ellipse, rgba(60,9,108,0.22) 0%, rgba(60,9,108,0) 70%)",
          }}
        />
        {/* background grain */}
        <div className="bg-grain-strong absolute inset-0 -z-10 opacity-[0.2]" />

        {/* mobile menu button */}
        <button
          aria-label="Toggle navigation"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>

        {/* logo (left) */}
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-extrabold text-primary"
        >
          <Image
            src="/skillbridge-logo.svg"
            alt="SkillBridge"
            width={24}
            height={24}
            className="h-6 w-auto"
          />
          <span className="hidden sm:inline">SkillBridge</span>
        </Link>

        {/* nav links (center) — scrollable on mobile, row on desktop */}
        <nav className="flex-1 overflow-x-auto">
          <div
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap",
              mobileOpen ? "md:static" : "md:gap-1"
            )}
          >
            {items.length === 0 && (
              <p className="px-3 text-sm text-gray-500">No items</p>
            )}
            {items.map((item, idx) => {
              const Icon = item.icon;
              const firstInSection =
                idx === 0 || items[idx - 1]?.section !== item.section;
              const active = isActive(item.href);
              return (
                <div key={item.href}>
                  {firstInSection && item.section !== "student" && (
                    <span className="mx-2 hidden text-xs font-semibold uppercase text-gray-400 md:inline-block">
                      {SECTION_LABEL[item.section]}
                    </span>
                  )}
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-primary/10 text-primary shadow-soft"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        active ? "text-primary" : "text-gray-400 group-hover:text-primary"
                      )}
                    />
                    {item.label}
                  </Link>
                </div>
              );
            })}
          </div>
        </nav>

        {/* user + logout (right) */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden flex-col items-end sm:flex">
              <p className="font-display text-sm font-bold text-gray-900">
                {user.name}
              </p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center justify-center rounded-xl p-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:ml-1 sm:inline">Log out</span>
          </button>
        </div>
      </header>

      {/* page content */}
      <main className="relative flex-1 p-4 sm:p-8">
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
