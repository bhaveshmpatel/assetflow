"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    const name = formData.get("name") as string;
    const prefix = formData.get("prefix") as string;
    const description = formData.get("description") as string;

    if (!name || !prefix) return { success: false, error: "Name and prefix are required" };

    await prisma.assetCategory.create({
      data: { name, prefix }
    });

    revalidatePath("/setup");
    return { success: true, message: "Category created successfully" };
  } catch (error: any) {
    return { success: false, error: "Failed to create category" };
  }
}

export async function createEmployee(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const employeeId = formData.get("employeeId") as string;
    const role = formData.get("role") as any;
    const departmentId = formData.get("departmentId") as string;

    if (!name || !email || !employeeId) return { success: false, error: "Name, email and employee ID are required" };

    const depId = departmentId === "unassigned" || !departmentId ? null : departmentId;

    await prisma.user.create({
      data: {
        name,
        email,
        employeeId,
        role: role || "EMPLOYEE",
        departmentId: depId,
        passwordHash: "$2b$10$temporaryMockHashPlaceholder0123456789" // In real app, send invite or generate random
      }
    });

    revalidatePath("/setup");
    return { success: true, message: "Employee created successfully" };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: "Email or Employee ID already exists" };
    return { success: false, error: "Failed to create employee" };
  }
}
