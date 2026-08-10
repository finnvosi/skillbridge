'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  ClipboardList,
  User,
  Briefcase,
  Users,
  Building2,
  ShieldCheck,
  ListChecks,
  FileCheck2,
  LogOut,
} from "lucide-react";
import { getToken, clearToken } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { ApiUser } from "@/lib/api-client";

interface NavItem {
  label: string;
  href: string;
  roles: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", roles: ["student", "employer", "admin"], icon: LayoutDashboard },
  { label: "Discover", href: "/dashboard/student", roles: ["student"], icon: Compass },
  { label: "My Applications", href: "/dashboard/student/applications", roles: ["student"], icon: ClipboardList },
  { label: "Profile", href: "/dashboard/student/profile", roles: ["student"], icon: User },
  { label: "Opportunities", href: "/dashboard/employer", roles: ["employer"], icon: Briefcase },
  { label: "Applicants", href: "/dashboard/employer/applicants", roles: ["employer"], icon: Users },
  { label: "Company", href: "/dashboard/employer/company", roles: ["employer"], icon: Building2 },
  { label: "Overview", href: "/dashboard/admin", roles: ["admin"], icon: ShieldCheck },
  { label: "Users", href: "/dashboard/admin/users", roles: ["admin"], icon: Users },
  { label: "Opportunities", href: "/dashboard/admin/opportunities", roles: ["admin"], icon: ListChecks },
  { label: "Applications", href: "/dashboard/admin/applications", roles: ["admin"], icon: FileCheck2 },
];

export function DashboardShell({
  user,
  children,
}: {
  user: ApiUser | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const items = navItems.filter((i) => !user || i.roles.includes(user.role));

  const logout = () => {
    clearToken();
    router.push("/auth/login");
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="relative hidden w-64 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/skillbridge-logo.svg"
              alt="SkillBridge"
              width={28}
              height={28}
              className="h-7 w-auto"
            />
            <span className="font-display text-lg font-extrabold text-primary">
              SkillBridge
            </span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary shadow-soft"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-gray-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-gray-200 p-4">
          {user && (
            <p className="mb-2 truncate text-sm font-medium text-gray-900">
              {user.name}
            </p>
          )}
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
          <span className="font-display text-lg font-extrabold text-primary">
            SkillBridge
          </span>
          <button onClick={logout} className="text-sm text-gray-600">
            Log out
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
