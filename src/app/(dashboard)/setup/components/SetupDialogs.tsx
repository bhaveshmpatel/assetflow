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
import { createCategory, createEmployee } from "@/actions/setup";

export function SetupDialogs({ type, users, departments }: { type: "department" | "category" | "employee", users: any[], departments: any[] }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function actionWrapper(formData: FormData) {
    setIsSubmitting(true);
    let result;
    if (type === "department") {
      result = await createDepartment(formData);
    } else if (type === "category") {
      result = await createCategory(formData);
    } else {
      result = await createEmployee(formData);
    }
    
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
          <Plus className="mr-1.5 h-3.5 w-3.5" /> 
          {type === "department" ? "Add Department" : type === "category" ? "Add Category" : "Add Employee"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-50 shadow-2xl">
        <DialogHeader>
          <DialogTitle>
            {type === "department" ? "Create New Department" : type === "category" ? "Add Asset Category" : "Add Employee"}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {type === "department" 
              ? "Add a new organizational unit. You can assign a manager later if needed." 
              : type === "category" 
              ? "Define a new category to group related assets." 
              : "Register a new employee and assign roles/departments."}
          </DialogDescription>
        </DialogHeader>
        {type === "department" && (
          <form action={actionWrapper} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300">Department Name</Label>
              <Input 
                id="name" name="name" placeholder="e.g. Engineering" required
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-zinc-200" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="managerId" className="text-zinc-300">Head Manager (Optional)</Label>
              <Select name="managerId">
                <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:ring-emerald-500 text-zinc-300">
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                  <SelectItem value="unassigned">Leave Unassigned</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500 text-white w-full">
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : "Save Department"}
              </Button>
            </div>
          </form>
        )}

        {type === "category" && (
          <form action={actionWrapper} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300">Category Name</Label>
              <Input id="name" name="name" placeholder="e.g. Laptops" required className="bg-zinc-900 border-zinc-800 text-zinc-200 focus-visible:ring-emerald-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prefix" className="text-zinc-300">Asset Tag Prefix</Label>
              <Input id="prefix" name="prefix" placeholder="e.g. LAP" required className="bg-zinc-900 border-zinc-800 text-zinc-200 focus-visible:ring-emerald-500" />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500 text-white w-full">
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : "Save Category"}
              </Button>
            </div>
          </form>
        )}

        {type === "employee" && (
          <form action={actionWrapper} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-300">Full Name</Label>
                <Input id="name" name="name" required className="bg-zinc-900 border-zinc-800 text-zinc-200 focus-visible:ring-emerald-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Email</Label>
                <Input id="email" name="email" type="email" required className="bg-zinc-900 border-zinc-800 text-zinc-200 focus-visible:ring-emerald-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId" className="text-zinc-300">Employee ID</Label>
                <Input id="employeeId" name="employeeId" className="bg-zinc-900 border-zinc-800 text-zinc-200 focus-visible:ring-emerald-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-zinc-300">Role</Label>
                <Select name="role" defaultValue="EMPLOYEE">
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:ring-emerald-500 text-zinc-300">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                    <SelectItem value="DEPARTMENT_HEAD">Department Head</SelectItem>
                    <SelectItem value="ASSET_MANAGER">Asset Manager</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="departmentId" className="text-zinc-300">Department</Label>
              <Select name="departmentId">
                <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:ring-emerald-500 text-zinc-300">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500 text-white w-full">
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : "Save Employee"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
