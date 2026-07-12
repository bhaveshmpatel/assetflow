"use client";

import { motion } from "framer-motion";
import { 
  Laptop, 
  Wrench, 
  ShieldCheck, 
  CalendarClock, 
  ArrowUpRight,
  GitPullRequest
} from "lucide-react";

const features = [
  {
    title: "Asset Lifecycle Engine",
    description: "Track every state from procurement to retirement. Custom states tailored for your workflows.",
    icon: <Laptop className="h-6 w-6 text-emerald-400" />,
    className: "md:col-span-2 md:row-span-2",
    visual: (
      <div className="mt-6 flex flex-wrap gap-2">
        {["Available", "Allocated", "Reserved", "Maintenance", "Retired"].map((status, i) => (
          <div key={status} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${i === 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
            {status}
          </div>
        ))}
      </div>
    )
  },
  {
    title: "Overlap-Free Booking",
    description: "Intelligent scheduling that auto-resolves conflicts before they happen.",
    icon: <CalendarClock className="h-6 w-6 text-indigo-400" />,
    className: "md:col-span-1 md:row-span-1",
    visual: (
      <div className="mt-4 relative h-12 w-full bg-zinc-900/50 rounded-lg overflow-hidden border border-zinc-800/50">
        <div className="absolute inset-y-2 left-2 right-12 bg-indigo-500/20 border border-indigo-500/30 rounded-md">
          <div className="h-full w-full bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(99,102,241,0.1)_4px,rgba(99,102,241,0.1)_8px)]" />
        </div>
      </div>
    )
  },
  {
    title: "Kanban Maintenance",
    description: "Visual workflow boards for IT support & asset repairs.",
    icon: <Wrench className="h-6 w-6 text-orange-400" />,
    className: "md:col-span-1 md:row-span-1",
    visual: (
      <div className="mt-4 flex gap-2">
        <div className="flex-1 rounded border border-zinc-800 bg-zinc-900/30 p-2">
          <div className="h-1.5 w-8 rounded-full bg-zinc-700 mb-2" />
          <div className="h-8 rounded bg-zinc-800" />
        </div>
        <div className="flex-1 rounded border border-orange-500/30 bg-orange-500/10 p-2">
          <div className="h-1.5 w-8 rounded-full bg-orange-500/50 mb-2" />
          <div className="h-8 rounded bg-orange-500/20 border border-orange-500/30" />
        </div>
      </div>
    )
  },
  {
    title: "Enterprise Smart Audits",
    description: "Automated discrepancy resolution tracking missing or damaged items across global offices.",
    icon: <ShieldCheck className="h-6 w-6 text-blue-400" />,
    className: "md:col-span-2 md:row-span-1",
    visual: (
      <div className="mt-6 flex items-center justify-between border border-zinc-800/50 rounded-lg p-3 bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <GitPullRequest className="h-4 w-4 text-zinc-500" />
          <span className="text-sm font-mono text-zinc-300">Audit_Q3_NYC</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-emerald-400">98% Verified</span>
        </div>
      </div>
    )
  }
];

export function BentoGrid() {
  return (
    <section className="py-24 relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
            Built for scale. Designed for speed.
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            A comprehensive toolset that transforms chaos into a well-oiled machine.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[240px] gap-4">
          {features.map((feature, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              key={feature.title}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800 p-6 hover:border-zinc-700 transition-colors ${feature.className}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 to-zinc-950 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
                  {feature.title}
                  <ArrowUpRight className="h-4 w-4 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="mt-2 text-sm text-zinc-400 max-w-sm">
                  {feature.description}
                </p>
              </div>
              
              <div className="relative z-10 mt-auto">
                {feature.visual}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
