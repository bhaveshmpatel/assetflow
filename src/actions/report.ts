"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function getExportData() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "ASSET_MANAGER" && user.role !== "DEPARTMENT_HEAD")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const assets = await prisma.asset.findMany({
      include: {
        category: true,
        department: true,
      },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, assets };
  } catch (error) {
    return { success: false, error: "Failed to fetch export data" };
  }
}
