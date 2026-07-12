"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Box, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-6 backdrop-blur-md bg-zinc-950/70 border-b border-zinc-800"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-500">
          <Layers className="h-5 w-5" />
        </div>
        <span className="text-xl font-semibold tracking-tight text-zinc-50">
          AssetFlow
        </span>
      </div>

      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
        <Link href="#" className="hover:text-zinc-50 transition-colors">
          Features
        </Link>
        <Link href="#" className="hover:text-zinc-50 transition-colors">
          Solutions
        </Link>
        <Link href="#" className="hover:text-zinc-50 transition-colors">
          Analytics
        </Link>
        <Link href="#" className="hover:text-zinc-50 transition-colors">
          Documentation
        </Link>
      </nav>

      <div className="flex items-center gap-4">
        <Link href="/sign-in">
          <Button variant="ghost" className="text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800/50">
            Sign In
          </Button>
        </Link>
        <Link href="/sign-up">
          <Button className="bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            Request Access
          </Button>
        </Link>
      </div>
    </motion.header>
  );
}
