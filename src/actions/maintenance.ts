"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { AssetStatus, MaintenanceStatus, Prisma } from "@prisma/client";
import { z } from "zod";

const updateSchema = z.object({
  id: z.string().cuid("Invalid ID format"),
  newStatus: z.nativeEnum(MaintenanceStatus)
});

export async function updateMaintenanceStatus(id: string, newStatus: MaintenanceStatus) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "EMPLOYEE") {
      return { success: false, error: "Unauthorized. Employees cannot update maintenance status." };
    }

    const validated = updateSchema.parse({ id, newStatus });

    await prisma.$transaction(async (tx) => {
      const request = await tx.maintenanceRequest.findUnique({
        where: { id: validated.id },
        include: { asset: true }
      });

      if (!request) throw new Error("Maintenance request not found");

      const updateData: Prisma.MaintenanceRequestUpdateInput = { status: validated.newStatus };
      let assetStatusUpdate: AssetStatus | null = null;

      // Business logic mappings
      if (validated.newStatus === "APPROVED") {
        updateData.approvedBy = { connect: { id: user.id } };
        assetStatusUpdate = "UNDER_MAINTENANCE";
      } else if (validated.newStatus === "RESOLVED") {
        updateData.resolvedAt = new Date();
        assetStatusUpdate = "AVAILABLE";
      }

      await tx.maintenanceRequest.update({
        where: { id: validated.id },
        data: updateData,
      });

      if (assetStatusUpdate) {
        await tx.asset.update({
          where: { id: request.assetId },
          data: { status: assetStatusUpdate }
        });
      }

      await tx.activityLog.create({
        data: {
          userId: user.id,
          type: "SYSTEM",
          actionDescription: `Moved maintenance request for ${request.asset.assetTag} to ${newStatus}`,
        }
      });
    });

    revalidatePath("/maintenance");
    return { success: true };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: (error as any).errors[0].message };
    }
    return { success: false, error: error.message || "Failed to update status." };
  }
}
