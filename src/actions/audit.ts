"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AuditItemCondition, AssetStatus, AuditStatus, LogType } from "@prisma/client";
import { revalidatePath } from "next/cache";

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
