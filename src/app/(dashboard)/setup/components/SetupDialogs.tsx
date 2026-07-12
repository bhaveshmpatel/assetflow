"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
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
import { createDepartment } from "@/actions/department";

export function SetupDialogs({ type, users }: { type: "department", users: any[] }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function actionWrapper(formData: FormData) {
    setIsSubmitting(true);
    const result = await createDepartment(formData);
    setIsSubmitting(false);
    
    if (result.success) {
      toast.success(result.message);
      setOpen(false);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* @ts-ignore */}
      <DialogTrigger asChild>
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 h-8">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Department
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-50 shadow-2xl">
        <DialogHeader>
          <DialogTitle>Create New Department</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Add a new organizational unit. You can assign a manager later if needed.
          </DialogDescription>
        </DialogHeader>
        <form action={actionWrapper} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-300">Department Name</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="e.g. Engineering" 
              required
              className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="managerId" className="text-zinc-300">Head Manager (Optional)</Label>
            <Select name="managerId">
              <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:ring-emerald-500 text-zinc-300">
                <SelectValue placeholder="Select a manager" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                <SelectItem value="">Leave Unassigned</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white w-full"
            >
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : "Save Department"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
