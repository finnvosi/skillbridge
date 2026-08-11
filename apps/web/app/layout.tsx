import type { Metadata } from "next";
import "./globals.css";
import { CursorGlow } from "@/components/layout/cursor-glow";
import { CustomCursor } from "@/components/layout/custom-cursor";

export const metadata: Metadata = {
  title: "SkillBridge — Bridge Your Skills to Real Opportunities",
  description:
    "Connect students with employers through meaningful projects, jobs, and career opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="relative min-h-full flex flex-col h-full bg-white text-foreground font-sans antialiased">
        {/* Three-layer ambient background: white base + cursor aura + frosted veil */}
        <CursorGlow />
        {/* Custom agency cursor (dot + trailing ring) */}
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
