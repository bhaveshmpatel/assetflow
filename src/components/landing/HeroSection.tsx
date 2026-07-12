"use client";

import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Activity, CalendarDays, CheckCircle2 } from "lucide-react";

export function HeroSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950 to-zinc-950 -z-10" />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-4xl text-center"
        >
          <motion.div variants={itemVariants} className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              AssetFlow 2.0 is now available
            </span>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-zinc-100 via-zinc-300 to-zinc-600 mb-8"
          >
            Orchestrate Your Enterprise Assets. <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-indigo-500">Zero Overlaps. Total Control.</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="mt-6 text-lg md:text-xl leading-8 text-zinc-400 max-w-2xl mx-auto"
          >
            Eliminate manual spreadsheets. Automate asset lifecycles, resolve booking conflicts instantly, and conduct smart audits with a platform designed for scale.
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <Button size="lg" className="h-12 px-8 bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all hover:scale-105 rounded-full font-medium">
              Launch Platform <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 transition-all hover:scale-105 rounded-full font-medium backdrop-blur-sm">
              <Play className="mr-2 h-4 w-4 text-emerald-400" /> Book a Demo
            </Button>
          </motion.div>
        </motion.div>
        
        {/* Mockup Dashboard */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, type: "spring", stiffness: 80 }}
          className="mt-20 relative mx-auto max-w-5xl"
        >
          <div className="absolute -top-4 -inset-x-4 bg-gradient-to-t from-emerald-500/10 to-transparent blur-3xl h-64 -z-10" />
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 shadow-2xl backdrop-blur-xl overflow-hidden ring-1 ring-white/10">
            <div className="flex items-center gap-2 border-b border-zinc-800/50 bg-zinc-900/50 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-zinc-700" />
                <div className="h-3 w-3 rounded-full bg-zinc-700" />
                <div className="h-3 w-3 rounded-full bg-zinc-700" />
              </div>
              <div className="mx-auto rounded-md bg-zinc-950/50 px-3 py-1 text-xs text-zinc-500 font-mono">
                app.assetflow.com/dashboard
              </div>
            </div>
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 flex flex-col gap-4">
                <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-5 flex items-start gap-4 hover:border-emerald-500/30 transition-colors">
                  <div className="rounded-lg bg-emerald-500/20 p-2.5">
                    <Activity className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-400">Total Active Assets</p>
                    <h3 className="text-2xl font-bold text-zinc-100">12,482</h3>
                    <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                      <ArrowRight className="h-3 w-3 -rotate-45" /> +14.2% this month
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-5 flex items-start gap-4 hover:border-indigo-500/30 transition-colors">
                  <div className="rounded-lg bg-indigo-500/20 p-2.5">
                    <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-400">Conflict-Free Bookings</p>
                    <h3 className="text-2xl font-bold text-zinc-100">99.9%</h3>
                    <p className="text-xs text-indigo-400 mt-1 flex items-center gap-1">
                      System auto-resolved 42 overlaps
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="col-span-1 md:col-span-2 rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-5">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="font-semibold text-zinc-100">Live Asset Timeline</h4>
                    <p className="text-xs text-zinc-500">MacBook Pro M3 Max Fleet</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 border-zinc-800 text-xs">
                    <CalendarDays className="mr-2 h-3 w-3" /> Filter
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {[
                    { id: "MBP-204", status: "Allocated", user: "Sarah Jenkins", progress: 70, color: "bg-emerald-500" },
                    { id: "MBP-205", status: "Reserved", user: "David Chen", progress: 100, color: "bg-indigo-500" },
                    { id: "MBP-206", status: "Maintenance", user: "IT Dept", progress: 30, color: "bg-orange-500" },
                  ].map((asset, i) => (
                    <motion.div 
                      key={asset.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + (i * 0.2) }}
                      className="group flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-950/50 p-3 hover:border-zinc-700 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${asset.color} shadow-[0_0_8px_currentColor]`} />
                        <div>
                          <p className="text-sm font-medium text-zinc-300">{asset.id}</p>
                          <p className="text-xs text-zinc-500">{asset.user}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded-md">
                          {asset.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
