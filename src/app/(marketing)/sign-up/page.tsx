"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Layers, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const insights = [
  "Asset Tag AF-0401 successfully transferred to Design Dept.",
  "Automated audit completed for Q3 London Office.",
  "Conflict resolved: MacBook Pro M3 Max schedule updated.",
  "14 new workstations provisioned and allocated."
];

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid corporate email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  employeeId: z.string().min(3, "Employee ID is required."),
  department: z.string().min(2, "Department is required.")
});

type FormValues = z.infer<typeof formSchema>;

import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignUpPage() {
  const [insightIndex, setInsightIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setInsightIndex((current) => (current + 1) % insights.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.fullName,
          email: data.email,
          password: data.password,
          employeeId: data.employeeId,
          department: data.department
        }),
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        toast.error(json.error || "Failed to create account");
      } else {
        toast.success("Account created! Please sign in.");
        router.push("/sign-in");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Left Panel - Ambient Gradient & Insights */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between overflow-hidden p-12 bg-zinc-900 border-r border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-zinc-900 to-indigo-900/40 -z-10" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
        
        <div className="relative z-10 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
            <Layers className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            AssetFlow
          </span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            Systematic control over every corporate asset.
          </h1>
          <p className="text-lg text-zinc-300 mb-12">
            Join thousands of enterprises orchestrating their hardware, software, and physical resources with zero overlaps.
          </p>

          {/* Cycling Insights Terminal */}
          <div className="rounded-xl border border-zinc-700/50 bg-zinc-950/80 p-5 backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Live System Feed</span>
            </div>
            <div className="h-12 flex items-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={insightIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="font-mono text-sm text-emerald-400"
                >
                  {">"} {insights[insightIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} AssetFlow Enterprise. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 relative">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-2 mb-12 absolute top-8 left-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
            <Layers className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            AssetFlow
          </span>
        </div>

        <div className="mx-auto w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h2 className="text-3xl font-bold text-white mb-2">Create an account</h2>
            <p className="text-zinc-400 mb-8">
              Enter your details to request platform access.
            </p>

            <Badge variant="outline" className="mb-8 w-full justify-start py-3 px-4 bg-orange-500/10 border-orange-500/30 text-orange-200 gap-3 whitespace-normal h-auto rounded-lg">
              <AlertCircle className="h-5 w-5 shrink-0 text-orange-400" />
              <div className="text-xs leading-relaxed">
                <strong className="block mb-1 text-sm text-orange-300">Critical Business Logic:</strong>
                All new accounts initialize with standard Employee permissions. Administrative or Manager role escalation must be granted by your local system administrator post-registration.
              </div>
            </Badge>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-zinc-300">Full Name</Label>
                  <Input 
                    id="fullName" 
                    placeholder="John Doe" 
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500"
                    {...register("fullName")}
                  />
                  {errors.fullName && <p className="text-xs text-red-400">{errors.fullName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="text-zinc-300">Employee ID</Label>
                  <Input 
                    id="employeeId" 
                    placeholder="EMP-001" 
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500"
                    {...register("employeeId")}
                  />
                  {errors.employeeId && <p className="text-xs text-red-400">{errors.employeeId.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Work Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john.doe@company.com" 
                  className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500"
                  {...register("email")}
                />
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-zinc-300">Department</Label>
                <select 
                  id="department"
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                  {...register("department")}
                >
                  <option value="">Select a department...</option>
                  <option value="engineering">Engineering</option>
                  <option value="design">Design</option>
                  <option value="hr">Human Resources</option>
                  <option value="finance">Finance</option>
                  <option value="operations">Operations</option>
                </select>
                {errors.department && <p className="text-xs text-red-400">{errors.department.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300">Corporate Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500"
                  {...register("password")}
                />
                {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-white text-zinc-950 hover:bg-zinc-200 h-11 font-medium mt-2 transition-all hover:scale-[1.02]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    Request Authorization <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-zinc-400">
              Already have an account?{" "}
              <Link href="/sign-in" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                Sign In instead
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
