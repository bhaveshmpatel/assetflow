"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const allocationSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  targetUserId: z.string().min(1, "User is required"),
  departmentId: z.string().optional().or(z.literal("")),
  expectedReturnDate: z.string().optional().or(z.literal("")),
  conditionNotes: z.string().optional().or(z.literal("")),
});

export async function createAllocation(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "EMPLOYEE") {
      return { success: false, error: "Unauthorized. Employees cannot directly allocate." };
    }

    const data = {
      assetId: formData.get("assetId") as string,
      targetUserId: formData.get("targetUserId") as string,
      departmentId: formData.get("departmentId") as string,
      expectedReturnDate: formData.get("expectedReturnDate") as string,
      conditionNotes: formData.get("conditionNotes") as string,
    };

    const validated = allocationSchema.parse(data);

    await prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({ where: { id: validated.assetId } });
      if (!asset) throw new Error("Asset not found");
      if (asset.status === "ALLOCATED") throw new Error("Asset is already allocated. Use transfer request.");
      if (asset.status !== "AVAILABLE") throw new Error("Asset is not available for allocation.");

      const allocation = await tx.allocation.create({
        data: {
          assetId: validated.assetId,
          userId: validated.targetUserId,
          assignedById: user.id,
          departmentId: validated.departmentId || null,
          expectedReturnDate: validated.expectedReturnDate ? new Date(validated.expectedReturnDate) : null,
          conditionNotes: validated.conditionNotes || null,
        },
      });

      await tx.asset.update({
        where: { id: validated.assetId },
        data: {
          status: "ALLOCATED",
          currentAllocationId: allocation.id,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: user.id,
          type: "SYSTEM",
          actionDescription: `Allocated asset ${asset.assetTag} to user ${validated.targetUserId}`,
        }
      });
    });

    revalidatePath("/transfers");
    return { success: true, message: "Asset successfully allocated." };
  } catch (error: any) {
    console.error("Allocation error:", error);
    if (error instanceof z.ZodError) return { success: false, error: (error as any).errors[0].message };
    return { success: false, error: error.message || "Failed to allocate asset." };
  }
}

const transferSchema = z.object({
  allocationId: z.string().min(1),
  targetUserId: z.string().min(1, "Target employee is required"),
  managerNotes: z.string().optional().or(z.literal("")),
});

export async function createTransferRequest(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const data = {
      allocationId: formData.get("allocationId") as string,
      targetUserId: formData.get("targetUserId") as string,
      managerNotes: formData.get("managerNotes") as string,
    };

    const validated = transferSchema.parse(data);

    await prisma.$transaction(async (tx) => {
      const allocation = await tx.allocation.findUnique({
        where: { id: validated.allocationId },
        include: { asset: true }
      });

      if (!allocation) throw new Error("Allocation not found");

      await tx.transferRequest.create({
        data: {
          allocationId: validated.allocationId,
          requestedById: user.id,
          targetUserId: validated.targetUserId,
          status: "PENDING",
          managerNotes: validated.managerNotes || null,
        }
      });

      await tx.activityLog.create({
        data: {
          userId: user.id,
          type: "APPROVAL",
          actionDescription: `Requested transfer of asset ${allocation.asset.assetTag} to user ${validated.targetUserId}`,
        }
      });
    });

    revalidatePath("/transfers");
    return { success: true, message: "Transfer request submitted successfully." };
  } catch (error: any) {
    if (error instanceof z.ZodError) return { success: false, error: (error as any).errors[0].message };
    return { success: false, error: error.message || "Failed to submit transfer request." };
  }
}
