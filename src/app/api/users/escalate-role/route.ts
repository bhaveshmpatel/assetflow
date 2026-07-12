import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const escalateRoleSchema = z.object({
  targetUserId: z.string().min(1),
  newRole: z.enum(["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"]),
});

export async function POST(request: Request) {
  try {
    // Middleware verifies auth and adds x-user-role header.
    const requesterRole = request.headers.get("x-user-role");

    // Strictly enforce ADMIN-only access
    if (requesterRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only Administrators can escalate roles." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = escalateRoleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input data", details: result.error.format() },
        { status: 400 }
      );
    }

    const { targetUserId, newRole } = result.data;

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(
      { message: "Role escalated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Escalate role error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
