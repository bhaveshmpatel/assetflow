"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { registerAsset } from "@/actions/asset";
import { AssetCategory, Department } from "@prisma/client";

export function AssetDialogs({ categories, departments }: { categories: AssetCategory[], departments: Department[] }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function actionWrapper(formData: FormData) {
    if (!formData.get("categoryId")) {
      toast.error("Category is required.");
      return;
    }

    const result = await registerAsset(formData);
    
    if (result.success) {
      toast.success(result.message);
      setOpen(false);
      formRef.current?.reset();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* @ts-ignore */}
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)] w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Register Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-50 shadow-2xl">
        <DialogHeader>
          <DialogTitle>Register New Asset</DialogTitle>
          <DialogDescription className="text-zinc-400">
            The Asset Tag will be auto-generated sequentially.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={actionWrapper} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-300">Asset Name/Model</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="e.g. MacBook Pro M3 Max" 
              required
              className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId" className="text-zinc-300">Category *</Label>
            {categories.length === 0 ? (
              <p className="text-xs text-red-400">Please create an Asset Category in Setup first.</p>
            ) : (
              <Select name="categoryId" required>
                <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:ring-emerald-500 text-zinc-300">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id} label={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="departmentId" className="text-zinc-300">Assign to Department (Optional)</Label>
            <Select name="departmentId">
              <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:ring-emerald-500 text-zinc-300">
                <SelectValue placeholder="Global / Unassigned" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                <SelectItem value="">Global / Unassigned</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id} label={d.name}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-zinc-300">Location</Label>
            <Input 
              id="location" 
              name="location" 
              placeholder="e.g. Server Room A, Floor 3" 
              className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" 
            />
          </div>
          
          <div className="flex justify-end pt-4">
            <SubmitButton 
              disabled={categories.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20"
              loadingText="Registering..."
            >
              Register Asset
            </SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
