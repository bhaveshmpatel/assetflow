"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AssetStatus } from "@prisma/client";

const assetSchema = z.object({
  name: z.string().min(2, "Asset name is required"),
  categoryId: z.string().min(1, "Category is required"),
  departmentId: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  status: z.nativeEnum(AssetStatus).default("AVAILABLE"),
});

export async function registerAsset(formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      categoryId: formData.get("categoryId") as string,
      departmentId: formData.get("departmentId") as string,
      location: formData.get("location") as string,
      status: (formData.get("status") as AssetStatus) || "AVAILABLE",
    };

    const validatedData = assetSchema.parse(rawData);

    // Auto-generate Tag in a transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Find highest asset tag starting with AF-
      const latestAsset = await tx.asset.findFirst({
        where: { assetTag: { startsWith: "AF-" } },
        orderBy: { assetTag: "desc" },
      });

      let nextNumber = 1;
      if (latestAsset) {
        const parts = latestAsset.assetTag.split("-");
        if (parts.length === 2 && !isNaN(Number(parts[1]))) {
          nextNumber = parseInt(parts[1], 10) + 1;
        }
      }
      
      const newTag = `AF-${nextNumber.toString().padStart(4, "0")}`;

      return await tx.asset.create({
        data: {
          assetTag: newTag,
          name: validatedData.name,
          categoryId: validatedData.categoryId,
          departmentId: validatedData.departmentId || null,
          location: validatedData.location || null,
          status: validatedData.status,
        },
      });
    });

    revalidatePath("/assets");
    return { success: true, message: `Asset ${result.assetTag} registered successfully.` };
  } catch (error) {
    console.error("Register asset error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: (error as any).errors[0].message };
    }
    return { success: false, error: "Failed to register asset." };
  }
}
