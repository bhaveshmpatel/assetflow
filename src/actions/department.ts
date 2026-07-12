"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const departmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  managerId: z.string().optional().or(z.literal("")),
});

export async function createDepartment(formData: FormData) {
  try {
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
