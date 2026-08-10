'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { getToken, clearToken } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { ApiUser } from "@/lib/api-client";

interface NavItem {
  label: string;
  href: string;
  roles: string[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", roles: ["student", "employer", "admin"] },
  { label: "Discover", href: "/dashboard/student", roles: ["student"] },
  { label: "My Applications", href: "/dashboard/student/applications", roles: ["student"] },
  { label: "Profile", href: "/dashboard/student/profile", roles: ["student"] },
  { label: "Opportunities", href: "/dashboard/employer", roles: ["employer"] },
  { label: "Applicants", href: "/dashboard/employer/applicants", roles: ["employer"] },
  { label: "Company", href: "/dashboard/employer/company", roles: ["employer"] },
  { label: "Overview", href: "/dashboard/admin", roles: ["admin"] },
  { label: "Users", href: "/dashboard/admin/users", roles: ["admin"] },
  { label: "Opportunities", href: "/dashboard/admin/opportunities", roles: ["admin"] },
  { label: "Applications", href: "/dashboard/admin/applications", roles: ["admin"] },
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white md:flex">
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
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href || pathname.startsWith(item.href + "/")
                  ? "bg-primary/10 text-primary"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-200 p-4">
          {user && (
            <p className="mb-2 truncate text-sm font-medium text-gray-900">
              {user.name}
            </p>
          )}
          <button
            onClick={logout}
            className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
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
