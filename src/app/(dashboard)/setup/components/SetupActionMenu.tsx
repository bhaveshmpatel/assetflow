"use client";

import { useState } from "react";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SetupDialogs } from "./SetupDialogs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteDepartment } from "@/actions/department";
import { deleteCategory, deleteEmployee } from "@/actions/setup";

type ActionMenuProps = {
  type: "department" | "category" | "employee";
  item: any;
  users?: any[];
  departments?: any[];
};

export function SetupActionMenu({ type, item, users = [], departments = [] }: ActionMenuProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    let result;
    
    if (type === "department") {
      result = await deleteDepartment(item.id);
    } else if (type === "category") {
      result = await deleteCategory(item.id);
    } else if (type === "employee") {
      result = await deleteEmployee(item.id);
    }

    setIsDeleting(false);
    
    if (result && !result.success) {
      alert(result.error);
    } else {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-white" />}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
          <DropdownMenuItem 
            className="focus:bg-zinc-800 cursor-pointer"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem 
            className="focus:bg-red-900/50 text-red-400 cursor-pointer"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Re-use SetupDialogs for Editing by passing the existing item (requires modifying SetupDialogs slightly) */}
      <SetupDialogs 
        type={type} 
        users={users} 
        departments={departments} 
        editItem={item} 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-950 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This action cannot be undone. This will permanently delete the {type}.
              <br/><br/>
              Note: Deletion will be rejected if this {type} is actively linked to other records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); handleDelete(); }} 
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
