"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { MaintenanceStatus } from "@prisma/client";

export async function updateMaintenanceStatus(id: string, newStatus: MaintenanceStatus) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "EMPLOYEE") {
      return { success: false, error: "Unauthorized. Employees cannot update maintenance status." };
    }

    await prisma.$transaction(async (tx) => {
      const request = await tx.maintenanceRequest.findUnique({
        where: { id },
        include: { asset: true }
      });

      if (!request) throw new Error("Maintenance request not found");

      const updateData: any = { status: newStatus };
      let assetStatusUpdate: any = null;

      // Business logic mappings
      if (newStatus === "APPROVED") {
        updateData.approvedById = user.id;
        assetStatusUpdate = "UNDER_MAINTENANCE";
      } else if (newStatus === "RESOLVED") {
        updateData.resolvedAt = new Date();
        assetStatusUpdate = "AVAILABLE";
      }

      await tx.maintenanceRequest.update({
        where: { id },
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
    return { success: false, error: error.message || "Failed to update status." };
  }
}
