import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plugin 11 — Vibe Coder IDE",
  description:
    "The first IDE where the source of truth is human-readable notebooks — not code.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
