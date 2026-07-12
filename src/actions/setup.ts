"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Role } from "@prisma/client";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  prefix: z.string().min(2, "Prefix is required").toUpperCase()
});

const employeeSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  employeeId: z.string().min(2, "Employee ID is required"),
  role: z.nativeEnum(Role).default(Role.EMPLOYEE),
  departmentId: z.string().optional().or(z.literal("unassigned"))
});

export async function createCategory(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    const rawData = {
      name: formData.get("name") as string,
      prefix: formData.get("prefix") as string,
    };
    
    const validatedData = categorySchema.parse(rawData);

    await prisma.assetCategory.create({
      data: { name: validatedData.name, prefix: validatedData.prefix }
    });

    revalidatePath("/setup");
    return { success: true, message: "Category created successfully" };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: (error as any).errors[0].message };
    }
    return { success: false, error: "Failed to create category" };
  }
}

export async function createEmployee(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      employeeId: formData.get("employeeId") as string,
      role: formData.get("role") as string,
      departmentId: formData.get("departmentId") as string,
    };

    const validatedData = employeeSchema.parse(rawData);
    const depId = validatedData.departmentId === "unassigned" || !validatedData.departmentId ? null : validatedData.departmentId;

    await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        employeeId: validatedData.employeeId,
        role: validatedData.role,
        departmentId: depId,
        passwordHash: "$2b$10$temporaryMockHashPlaceholder0123456789"
      }
    });

    revalidatePath("/setup");
    return { success: true, message: "Employee created successfully" };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: (error as any).errors[0].message };
    }
    if (error.code === 'P2002') return { success: false, error: "Email or Employee ID already exists" };
    return { success: false, error: "Failed to create employee" };
  }
}

export async function updateCategory(id: string, formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    const rawData = {
      name: formData.get("name") as string,
      prefix: formData.get("prefix") as string,
    };
    
    const validatedData = categorySchema.parse(rawData);

    await prisma.assetCategory.update({
      where: { id },
      data: { name: validatedData.name, prefix: validatedData.prefix }
    });

    revalidatePath("/setup");
    return { success: true, message: "Category updated successfully" };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: (error as any).errors[0].message };
    }
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    const category = await prisma.assetCategory.findUnique({
      where: { id },
      include: { _count: { select: { assets: true } } }
    });

    if (!category) return { success: false, error: "Category not found" };

    if (category._count.assets > 0) {
      return { success: false, error: `Cannot delete: ${category._count.assets} assets are associated with this category.` };
    }

    await prisma.assetCategory.delete({ where: { id } });

    revalidatePath("/setup");
    return { success: true, message: "Category deleted successfully" };
  } catch (error) {
    return { success: false, error: "Failed to delete category" };
  }
}

export async function updateEmployee(id: string, formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      employeeId: formData.get("employeeId") as string,
      role: formData.get("role") as string,
      departmentId: formData.get("departmentId") as string,
    };

    const validatedData = employeeSchema.parse(rawData);
    const depId = validatedData.departmentId === "unassigned" || !validatedData.departmentId ? null : validatedData.departmentId;

    await prisma.user.update({
      where: { id },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        employeeId: validatedData.employeeId,
        role: validatedData.role,
        departmentId: depId,
      }
    });

    revalidatePath("/setup");
    return { success: true, message: "Employee updated successfully" };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: (error as any).errors[0].message };
    }
    if (error.code === 'P2002') return { success: false, error: "Email or Employee ID already exists" };
    return { success: false, error: "Failed to update employee" };
  }
}

export async function deleteEmployee(id: string) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    // Self-deletion check
    if (user.id === id) {
      return { success: false, error: "You cannot delete your own account." };
    }

    const employee = await prisma.user.findUnique({
      where: { id },
      include: {
        managedDepartment: true,
        _count: {
          select: { allocations: true }
        }
      }
    });

    if (!employee) return { success: false, error: "Employee not found" };

    if (employee._count.allocations > 0) {
      return { success: false, error: `Cannot delete: Employee has ${employee._count.allocations} active allocations.` };
    }
    
    if (employee.managedDepartment) {
      return { success: false, error: `Cannot delete: Employee manages the ${employee.managedDepartment.name} department.` };
    }

    await prisma.user.delete({ where: { id } });

    revalidatePath("/setup");
    return { success: true, message: "Employee deleted successfully" };
  } catch (error) {
    return { success: false, error: "Failed to delete employee" };
  }
}
