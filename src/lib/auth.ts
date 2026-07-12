import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export interface SessionPayload {
  userId: string;
  role: string;
  departmentId?: string | null;
}

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length === 0) {
    // Fallback for development/sandbox only
    return "super-secret-sandbox-key-assetflow-123456";
  }
  return secret;
};

export const signToken = async (payload: SessionPayload) => {
  const secret = new TextEncoder().encode(getJwtSecretKey());
  const alg = "HS256";

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);
};

export const verifyToken = async (token: string) => {
  try {
    const secret = new TextEncoder().encode(getJwtSecretKey());
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
};

export const getCurrentUser = async () => {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;
    if (!sessionToken) return null;

    const payload = await verifyToken(sessionToken);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true, departmentId: true }
    });

    return user;
  } catch (error) {
    return null;
  }
};
