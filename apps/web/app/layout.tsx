import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-full flex flex-col h-full bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
