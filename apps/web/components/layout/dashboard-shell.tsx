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
  ShieldCheck,
  ListChecks,
  FileCheck2,
  LogOut,
  Menu,
  Settings,
  User as UserIcon,
  HelpCircle,
  Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  apiRequest,
  API_ENDPOINTS,
  clearToken,
  getToken,
} from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { ApiUser } from "@/lib/api-client";
import { useEffect, useState, useRef } from "react";
import { ScrollProgress } from "@/components/motion/scroll-progress";

interface NavItem {
  label: string;
  href: string;
  roles: string[];
  icon: React.ComponentType<{ className?: string }>;
  section: "student" | "employer" | "admin";
}

interface NotificationItem {
  id: string;
  applicationId?: string | null;
  title: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
}

const navItems: NavItem[] = [
  {
    label: "Overview",
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
    href: "/dashboard/employer/projects",
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

export function DashboardShell({
  user,
  children,
}: {
  user: ApiUser | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const navListRef = useRef<HTMLUListElement>(null);
  const menuWrapperRef = useRef<HTMLDivElement>(null);

  const items = navItems.filter((i) => !user || i.roles.includes(user.role));

  // role-aware target for both the Profile and Settings links (no dedicated
  // settings page exists yet, so Settings mirrors Profile)
  const profileHref =
    user?.role === "student"
      ? "/dashboard/student/profile"
      : user?.role === "employer"
        ? "/dashboard/employer/team"
        : user?.role === "admin"
          ? "/dashboard/admin"
          : "/dashboard";

  // exact-match active: parent route (/dashboard/employer) is only active on
  // its own page — not when you're on a child route (/talent, /team, etc.)
  const isExactActive = (href: string) => pathname === href;

  const logout = () => {
    clearToken();
    router.push("/auth/login");
  };

  const loadNotifications = async () => {
    const token = getToken();
    if (!token) return;
    setNotificationLoading(true);
    setNotificationError("");
    try {
      const data = await apiRequest<{
        notifications: NotificationItem[];
        unreadCount: number;
      }>(API_ENDPOINTS.users.notifications, { token });
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      setNotificationError("Couldn't load notifications.");
    } finally {
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, [user?.id]);

  useEffect(() => {
    const closeMenusOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setNotificationOpen(false);
      setMenuOpen(false);
    };
    window.addEventListener("keydown", closeMenusOnEscape);
    return () => window.removeEventListener("keydown", closeMenusOnEscape);
  }, []);

  // close both menus on outside pointer-down / focus loss. The trigger and
  // panel for BOTH menus live inside menuWrapperRef, so the opening click is
  // always "contained" and never closes the menu it just opened.
  useEffect(() => {
    const wrapper = menuWrapperRef.current;
    if (!wrapper) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapper.contains(event.target as Node)) {
        setNotificationOpen(false);
        setMenuOpen(false);
      }
    };
    const onFocusOut = (event: FocusEvent) => {
      const related = event.relatedTarget as Node | null;
      if (related === null || !wrapper.contains(related)) {
        setNotificationOpen(false);
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    wrapper.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      wrapper.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  const markNotificationRead = async (notification: NotificationItem) => {
    const token = getToken();
    if (!token) return;
    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id
          ? { ...item, readAt: new Date().toISOString() }
          : item,
      ),
    );
    if (!notification.readAt) setUnreadCount((count) => Math.max(0, count - 1));
    try {
      await apiRequest(
        API_ENDPOINTS.users.markNotificationRead(notification.id),
        {
          method: "PATCH",
          token,
        },
      );
    } catch {
      void loadNotifications();
    }
  };

  const markAllNotificationsRead = async () => {
    const token = getToken();
    if (!token) return;
    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        readAt: item.readAt ?? new Date().toISOString(),
      })),
    );
    setUnreadCount(0);
    try {
      await apiRequest(API_ENDPOINTS.users.markAllNotificationsRead, {
        method: "POST",
        token,
      });
    } catch {
      void loadNotifications();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      {/* ===== Full-width editorial header bar (fixed) ===== */}
      <header className="fixed inset-x-4 top-4 z-40 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-card-border/60 bg-white/80 px-4 py-3 shadow-soft-lg backdrop-blur-xl">
          {/* scroll progress */}
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
              {items.map((item) => {
                const Icon = item.icon;
                const active = isExactActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "relative z-[2] flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200",
                        active
                          ? "bg-primary/12 text-primary shadow-xs"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          active ? "text-primary" : "text-gray-500",
                        )}
                      />
                      {item.label}
                      {active && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-primary" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* notifications + user + kebab menu (right) */}
          <div
            ref={menuWrapperRef}
            className="relative flex items-center gap-1 pl-1.5 pr-1"
          >
            <div className="relative">
              <button
                type="button"
                aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
                aria-haspopup="dialog"
                aria-expanded={notificationOpen}
                onClick={() => {
                  setNotificationOpen((open) => !open);
                  setMenuOpen(false);
                }}
                className="relative flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] font-bold leading-4 text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] max-h-[70dvh] rounded-xl border border-card-border bg-white p-3 shadow-soft-lg sm:max-h-96"
                    role="dialog"
                    aria-label="Notifications"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-card-border pb-2">
                      <p className="font-display text-sm font-bold text-gray-900">
                        Notifications
                      </p>
                      <button
                        type="button"
                        className="text-xs font-medium text-primary disabled:text-gray-400"
                        disabled={unreadCount === 0}
                        onClick={() => void markAllNotificationsRead()}
                      >
                        Mark all read
                      </button>
                    </div>
                    {notificationLoading ? (
                      <div
                        className="space-y-2 py-3"
                        aria-label="Loading notifications"
                      >
                        <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
                        <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
                      </div>
                    ) : notificationError ? (
                      <div className="py-4 text-sm text-red-700">
                        <p>{notificationError}</p>
                        <button
                          type="button"
                          className="mt-2 font-medium underline"
                          onClick={() => void loadNotifications()}
                        >
                          Try again
                        </button>
                      </div>
                    ) : notifications.length === 0 ? (
                      <p className="py-5 text-sm text-gray-500">
                        No notifications yet.
                      </p>
                    ) : (
                      <div className="max-h-80 space-y-1 overflow-y-auto py-2">
                        {notifications.map((notification) => (
                          <button
                            type="button"
                            key={notification.id}
                            onClick={() =>
                              void markNotificationRead(notification)
                            }
                            className={cn(
                              "w-full rounded-lg p-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                              notification.readAt
                                ? "text-gray-600"
                                : "bg-primary/5 font-medium text-gray-900",
                            )}
                          >
                            <span className="flex items-start gap-2">
                              <span
                                aria-hidden
                                className={cn(
                                  "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                                  notification.readAt
                                    ? "bg-gray-200"
                                    : "bg-primary",
                                )}
                              />
                              <span className="min-w-0">
                                <span className="block">
                                  {notification.title}
                                </span>
                                <span className="mt-0.5 block line-clamp-2 text-xs font-normal text-gray-500">
                                  {notification.body}
                                </span>
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {user && (
              <div className="hidden flex-col items-end sm:flex">
                <p className="font-display text-sm font-bold text-gray-900">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            )}
            {/* kebab menu */}
            <button
              type="button"
              aria-label="Menu"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                menuOpen && "bg-gray-100 text-gray-900",
              )}
            >
              <Menu className="h-4 w-4" />
            </button>
            {/* dropdown — slide+fade (open/close only, not hover) */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.94 }}
                  transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-full right-0 z-50 mt-2 w-48 origin-top-right rounded-xl border border-card-border bg-white/80 p-1.5 shadow-soft-lg backdrop-blur-xl"
                  role="menu"
                  aria-label="User menu"
                >
                  <Link
                    href={profileHref}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <UserIcon className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    href={profileHref}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <Link
                    href="/"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <HelpCircle className="h-4 w-4" />
                    Help
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* page content — offset for full-width header bar */}
      <main className="relative flex-1 pt-24 lg:pt-28 p-4 sm:p-8">
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
