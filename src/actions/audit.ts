"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AuditItemCondition, AssetStatus, AuditStatus, LogType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function startAuditCycle(title: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "EMPLOYEE") {
      return { success: false, error: "Unauthorized" };
    }

    const activeAudit = await prisma.auditCycle.findFirst({
      where: { status: AuditStatus.ACTIVE }
    });

    if (activeAudit) {
      return { success: false, error: "An active audit already exists. Close it before starting a new one." };
    }

    // Fetch all active assets (exclude RETIRED or LOST which don't need physical audit usually, or maybe we include all?)
    // Let's include everything except RETIRED/LOST
    const assetsToAudit = await prisma.asset.findMany({
      where: {
        status: {
          notIn: [AssetStatus.RETIRED, AssetStatus.LOST]
        }
      }
    });

    if (assetsToAudit.length === 0) {
      return { success: false, error: "No trackable assets available to audit." };
    }

    await prisma.$transaction(async (tx) => {
      const cycle = await tx.auditCycle.create({
        data: {
          title,
          initiatedById: user.id,
          status: AuditStatus.ACTIVE,
        }
      });

      const auditItems = assetsToAudit.map(asset => ({
        auditCycleId: cycle.id,
        assetId: asset.id,
        condition: AuditItemCondition.VERIFIED 
      }));

      await tx.auditItem.createMany({
        data: auditItems
      });
      
      await tx.activityLog.create({
        data: {
          userId: user.id,
          actionDescription: `Started new audit: ${title}`,
          type: LogType.SYSTEM
        }
      });
    });

    revalidatePath("/audit");
    return { success: true, message: "New audit cycle started successfully." };
  } catch (error: any) {
    console.error("Start audit error:", error);
    return { success: false, error: "Failed to start new audit cycle." };
  }
}

export async function closeAuditCycle(
  auditId: string, 
  itemStates: { auditItemId: string, condition: AuditItemCondition, assetId: string }[]
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "EMPLOYEE") {
      return { success: false, error: "Unauthorized" };
    }

    let discrepancies = 0;

    await prisma.$transaction(async (tx) => {
      for (const item of itemStates) {
        // 1. Update AuditItem condition
        await tx.auditItem.update({
          where: { id: item.auditItemId },
          data: { condition: item.condition, verifiedById: user.id }
        });

        // 2. Update Asset status if needed
        if (item.condition === "MISSING") {
          await tx.asset.update({
            where: { id: item.assetId },
            data: { status: AssetStatus.LOST }
          });
          discrepancies++;
        } else if (item.condition === "DAMAGED") {
          await tx.asset.update({
            where: { id: item.assetId },
            data: { status: AssetStatus.UNDER_MAINTENANCE }
          });
          
          await tx.maintenanceRequest.create({
            data: {
              assetId: item.assetId,
              reportedById: user.id,
              description: `Automatically flagged as damaged during audit.`,
            }
          });
          
          discrepancies++;
        }
      }

      // 3. Mark AuditCycle as completed
      const cycle = await tx.auditCycle.update({
        where: { id: auditId },
        data: { 
          status: AuditStatus.COMPLETED,
          endDate: new Date(),
          discrepancyReportSummary: discrepancies > 0 ? `${discrepancies} assets flagged.` : 'All clear.'
        }
      });

      // 4. Create ActivityLog
      await tx.activityLog.create({
        data: {
          userId: user.id,
          actionDescription: `Closed audit: ${cycle.title} with ${discrepancies} discrepancies`,
          type: discrepancies > 0 ? LogType.ALERT : LogType.SYSTEM
        }
      });
    });

    revalidatePath("/audit");
    revalidatePath("/notifications");
    
    return { success: true, message: `Audit closed. ${discrepancies} discrepancies found.` };
  } catch (error: any) {
    console.error("Audit closure failed:", error);
    return { success: false, error: "Failed to close audit cycle." };
  }
}
