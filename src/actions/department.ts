"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";

const departmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  managerId: z.string().optional().or(z.literal("")),
});

export async function createDepartment(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized. Admin access required." };
    }

    const rawData = {
      name: formData.get("name") as string,
      managerId: formData.get("managerId") as string,
    };

    const validatedData = departmentSchema.parse(rawData);

    await prisma.department.create({
      data: {
        name: validatedData.name,
        managerId: validatedData.managerId || null,
      },
    });

    revalidatePath("/setup");
    return { success: true, message: "Department created successfully." };
  } catch (error) {
    console.error("Create department error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: (error as any).errors[0].message };
    }
    return { success: false, error: "Failed to create department. Name may already exist." };
  }
}

export async function updateDepartment(id: string, formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== "ADMIN") return { success: false, error: "Unauthorized." };

    const rawData = {
      name: formData.get("name") as string,
      managerId: formData.get("managerId") as string,
    };

    const validatedData = departmentSchema.parse(rawData);

    await prisma.department.update({
      where: { id },
      data: {
        name: validatedData.name,
        managerId: validatedData.managerId || null,
      },
    });

    revalidatePath("/setup");
    return { success: true, message: "Department updated successfully." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: (error as any).errors[0].message };
    }
    return { success: false, error: "Failed to update department." };
  }
}

export async function deleteDepartment(id: string) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== "ADMIN") return { success: false, error: "Unauthorized." };

    // Check relations before deleting
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true, assets: true, allocations: true }
        }
      }
    });

    if (!department) return { success: false, error: "Department not found." };

    if (department._count.users > 0) {
      return { success: false, error: `Cannot delete: ${department._count.users} users are assigned to this department.` };
    }
    if (department._count.assets > 0) {
      return { success: false, error: `Cannot delete: ${department._count.assets} assets are assigned to this department.` };
    }
    if (department._count.allocations > 0) {
      return { success: false, error: `Cannot delete: ${department._count.allocations} allocations belong to this department.` };
    }

    await prisma.department.delete({ where: { id } });

    revalidatePath("/setup");
    return { success: true, message: "Department deleted successfully." };
  } catch (error) {
    return { success: false, error: "Failed to delete department." };
  }
}
