import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const allocateAssetSchema = z.object({
  assetId: z.string().min(1),
  targetUserId: z.string().min(1),
  departmentId: z.string().optional(),
  expectedReturnDate: z.string().datetime().optional(),
  conditionNotes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const requesterId = request.headers.get("x-user-id");
    const requesterRole = request.headers.get("x-user-role");

    if (!requesterId || !requesterRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Usually, only ADMIN or ASSET_MANAGER should allocate directly.
    if (requesterRole === "EMPLOYEE") {
      return NextResponse.json(
        { error: "Forbidden: Employees cannot directly allocate assets." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = allocateAssetSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input data", details: result.error.format() },
        { status: 400 }
      );
    }

    const { assetId, targetUserId, departmentId, expectedReturnDate, conditionNotes } = result.data;

    // We must run a transaction to ensure atomicity
    const response = await prisma.$transaction(async (tx) => {
      // 1. Verify Asset status
      const asset = await tx.asset.findUnique({
        where: { id: assetId },
      });

      if (!asset) {
        throw new Error("ASSET_NOT_FOUND");
      }

      // 2. Reject if ALLOCATED
      if (asset.status === "ALLOCATED") {
        throw new Error("ASSET_ALREADY_ALLOCATED");
      }

      // 3. Reject if not AVAILABLE
      if (asset.status !== "AVAILABLE") {
        throw new Error("ASSET_NOT_AVAILABLE");
      }

      // 4. Create the allocation
      const allocation = await tx.allocation.create({
        data: {
          assetId,
          userId: targetUserId,
          assignedById: requesterId,
          departmentId: departmentId || null,
          expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null,
          conditionNotes,
        },
      });

      // 5. Update the Asset
      await tx.asset.update({
        where: { id: assetId },
        data: {
          status: "ALLOCATED",
          currentAllocationId: allocation.id,
        },
      });

      return allocation;
    });

    return NextResponse.json(
      { message: "Asset successfully allocated", allocation: response },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Allocate asset error:", error);

    if (error.message === "ASSET_NOT_FOUND") {
      return NextResponse.json({ error: "Asset not found." }, { status: 404 });
    }
    
    if (error.message === "ASSET_ALREADY_ALLOCATED") {
      return NextResponse.json(
        { 
          error: "Conflict", 
          message: "This asset is currently allocated to another user. Please submit a TransferRequest instead." 
        }, 
        { status: 409 }
      );
    }

    if (error.message === "ASSET_NOT_AVAILABLE") {
      return NextResponse.json(
        { error: "Asset is currently not available for allocation (e.g., lost or under maintenance)." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
