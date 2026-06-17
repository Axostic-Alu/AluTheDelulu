import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "AluTheDelulu — Lazy Gamer. Builder. Chaos Goblin.",
  description: "I'm Almaan. I build stuff when I'm bored because it feels good. Welcome to my domain.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-[var(--color-bg)] antialiased">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
