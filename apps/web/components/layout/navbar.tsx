import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/skillbridge-logo.svg"
            alt="SkillBridge"
            width={32}
            height={32}
            className="h-8 w-auto invert-0"
          />
          <span className="font-display text-xl font-extrabold text-primary">
            SkillBridge
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Sign in
          </Link>
          <Button variant="primary" size="sm" asChild>
            <Link href="/auth/register">Get started</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
