"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Layers, Loader2, KeyRound, Shield, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  email: z.string().email("Please enter a valid corporate email."),
  password: z.string().min(1, "Password is required.")
});

type FormValues = z.infer<typeof formSchema>;

import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Sign-in failed");
      } else {
        toast.success("Welcome back!");
        window.location.href = "/dashboard"; // hard reload to refresh navbar state
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSandboxLogin = async (role: string) => {
    const mappedRole = role === "Standard Employee" ? "EMPLOYEE" 
                     : role === "Asset Manager" ? "ASSET_MANAGER" 
                     : "ADMIN";
                     
    try {
      const res = await fetch("/api/auth/sandbox-bypass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: mappedRole }),
      });
      
      if (res.ok) {
        toast.success(`Sandbox Bypass Activated: Logged in as ${mappedRole}`);
        window.location.href = "/dashboard"; 
      } else {
        toast.error("Sandbox login failed.");
      }
    } catch (error) {
      toast.error("Sandbox login failed.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
        className="w-full max-w-[440px] z-10"
      >
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
              <Layers className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-zinc-50">
              AssetFlow
            </span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Welcome back</h1>
          <p className="text-sm text-zinc-400 mt-2">Enter your credentials to access your workspace</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Work Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@company.com" 
                className="h-11 bg-zinc-950/50 border-zinc-800 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all shadow-inner"
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-300">Password</Label>
                <Link href="#" className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                className="h-11 bg-zinc-950/50 border-zinc-800 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all shadow-inner"
                {...register("password")}
              />
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <div className="flex items-center space-x-2 pt-1 pb-2">
              <Checkbox id="remember" className="border-zinc-700 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500" />
              <Label htmlFor="remember" className="text-sm font-medium leading-none text-zinc-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                Remember my device for 30 days
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-11 font-medium transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authenticating...
                </>
              ) : (
                "Authenticate & Enter"
              )}
            </Button>
          </form>
        </div>
        
        <p className="mt-8 text-center text-sm text-zinc-400">
          Don't have an account?{" "}
          <Link href="/sign-up" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
            Request Access
          </Link>
        </p>

        {/* Developer Sandbox Bypass */}
        <div className="mt-12 pt-8 border-t border-zinc-800/50">
          <p className="text-xs font-mono text-center text-zinc-500 mb-4 uppercase tracking-widest">
            Developer Sandbox Bypass
          </p>
          <Tabs defaultValue="employee" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-zinc-900/80 border border-zinc-800">
              <TabsTrigger value="employee" className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50">
                <User className="h-3 w-3 mr-1.5" /> Employee
              </TabsTrigger>
              <TabsTrigger value="manager" className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50">
                <KeyRound className="h-3 w-3 mr-1.5" /> Manager
              </TabsTrigger>
              <TabsTrigger value="admin" className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50">
                <Shield className="h-3 w-3 mr-1.5" /> Admin
              </TabsTrigger>
            </TabsList>
            <TabsContent value="employee" className="mt-4">
              <Button onClick={() => handleSandboxLogin("Standard Employee")} variant="outline" className="w-full border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-sm h-10">
                Simulate Employee Login
              </Button>
            </TabsContent>
            <TabsContent value="manager" className="mt-4">
              <Button onClick={() => handleSandboxLogin("Asset Manager")} variant="outline" className="w-full border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-sm h-10">
                Simulate Manager Login
              </Button>
            </TabsContent>
            <TabsContent value="admin" className="mt-4">
              <Button onClick={() => handleSandboxLogin("System Administrator")} variant="outline" className="w-full border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-sm h-10">
                Simulate Admin Login
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}
