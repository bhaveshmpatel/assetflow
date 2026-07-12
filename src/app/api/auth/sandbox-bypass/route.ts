import { NextResponse } from "next/server";
import { signToken } from "@/lib/auth";
import { z } from "zod";

const sandboxSchema = z.object({
  role: z.enum(["ADMIN", "ASSET_MANAGER", "EMPLOYEE"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = sandboxSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid role requested for Sandbox Bypass." },
        { status: 400 }
      );
    }

    const { role } = result.data;

    // Generate mock user data based on role
    const mockUserId = `sandbox-${role.toLowerCase()}-${Date.now()}`;
    const payload = {
      userId: mockUserId,
      role: role,
      departmentId: role === "EMPLOYEE" ? null : "dept-sandbox-01",
    };

    // Sign stateless JWT
    const token = await signToken(payload);

    // Set cookie on response
    const response = NextResponse.json(
      { message: `Sandbox Bypass Authorized as ${role}`, user: payload },
      { status: 200 }
    );

    response.cookies.set({
      name: "session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 2, // 2 hours
    });

    return response;
  } catch (error) {
    console.error("Sandbox bypass error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
