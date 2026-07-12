import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "AssetFlow | Enterprise Asset Management",
  description: "Orchestrate Your Enterprise Assets. Zero Overlaps. Total Control.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50 selection:bg-emerald-500/30 selection:text-emerald-200">
        <Navbar />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
