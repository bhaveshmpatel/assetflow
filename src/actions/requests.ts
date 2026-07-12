"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function approveTransferRequest(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "ASSET_MANAGER")) {
      return { success: false, error: "Unauthorized. Manager approval required." };
    }

    await prisma.$transaction(async (tx) => {
      const request = await tx.transferRequest.findUnique({
        where: { id },
        include: { allocation: { include: { asset: true } } }
      });

      if (!request) throw new Error("Transfer request not found");
      if (request.status !== "PENDING") throw new Error("Request is not pending");

      // 1. Update transfer request status
      await tx.transferRequest.update({
        where: { id },
        data: { status: "APPROVED" }
      });

      // 2. Conclude current allocation
      await tx.allocation.update({
        where: { id: request.allocationId },
        data: { actualReturnDate: new Date() }
      });

      // 3. Create new allocation for target user
      const newAllocation = await tx.allocation.create({
        data: {
          assetId: request.allocation.assetId,
          userId: request.targetUserId,
          assignedById: user.id, // Approved by this manager
        }
      });

      // 4. Update asset's current allocation pointer
      await tx.asset.update({
        where: { id: request.allocation.assetId },
        data: { currentAllocationId: newAllocation.id }
      });

      // 5. Log it
      await tx.activityLog.create({
        data: {
          userId: user.id,
          type: "APPROVAL",
          actionDescription: `Approved transfer of ${request.allocation.asset.assetTag} to new user`,
        }
      });
    });

    revalidatePath("/notifications");
    revalidatePath("/transfers");
    return { success: true, message: "Transfer approved successfully." };
  } catch (error: any) {
    console.error("Transfer approval error:", error);
    return { success: false, error: error.message || "Failed to approve transfer." };
  }
}

export async function rejectTransferRequest(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "ASSET_MANAGER")) {
      return { success: false, error: "Unauthorized. Manager approval required." };
    }

    await prisma.$transaction(async (tx) => {
      const request = await tx.transferRequest.findUnique({
        where: { id },
        include: { allocation: { include: { asset: true } } }
      });

      if (!request) throw new Error("Transfer request not found");
      if (request.status !== "PENDING") throw new Error("Request is not pending");

      await tx.transferRequest.update({
        where: { id },
        data: { status: "REJECTED" }
      });

      await tx.activityLog.create({
        data: {
          userId: user.id,
          type: "APPROVAL",
          actionDescription: `Rejected transfer request for ${request.allocation.asset.assetTag}`,
        }
      });
    });

    revalidatePath("/notifications");
    return { success: true, message: "Transfer request rejected." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to reject transfer." };
  }
}

export async function approveMaintenanceRequest(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "ASSET_MANAGER")) {
      return { success: false, error: "Unauthorized. Manager approval required." };
    }

    await prisma.$transaction(async (tx) => {
      const request = await tx.maintenanceRequest.findUnique({
        where: { id },
        include: { asset: true }
      });

      if (!request) throw new Error("Maintenance request not found");
      if (request.status !== "PENDING") throw new Error("Request is not pending");

      await tx.maintenanceRequest.update({
        where: { id },
        data: { 
          status: "APPROVED",
          approvedById: user.id
        }
      });
      
      // Update asset status to UNDER_MAINTENANCE if it wasn't already
      await tx.asset.update({
        where: { id: request.assetId },
        data: { status: "UNDER_MAINTENANCE" }
      });

      await tx.activityLog.create({
        data: {
          userId: user.id,
          type: "APPROVAL",
          actionDescription: `Approved maintenance for ${request.asset.assetTag}`,
        }
      });
    });

    revalidatePath("/notifications");
    revalidatePath("/maintenance");
    return { success: true, message: "Maintenance approved successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to approve maintenance." };
  }
}

export async function rejectMaintenanceRequest(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "ASSET_MANAGER")) {
      return { success: false, error: "Unauthorized. Manager approval required." };
    }

    await prisma.$transaction(async (tx) => {
      const request = await tx.maintenanceRequest.findUnique({
        where: { id },
        include: { asset: true }
      });

      if (!request) throw new Error("Maintenance request not found");
      if (request.status !== "PENDING") throw new Error("Request is not pending");

      await tx.maintenanceRequest.update({
        where: { id },
        data: { 
          status: "REJECTED",
          approvedById: user.id // Tracker of who rejected it
        }
      });

      await tx.activityLog.create({
        data: {
          userId: user.id,
          type: "APPROVAL",
          actionDescription: `Rejected maintenance request for ${request.asset.assetTag}`,
        }
      });
    });

    revalidatePath("/notifications");
    return { success: true, message: "Maintenance request rejected." };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to reject maintenance." };
  }
}
