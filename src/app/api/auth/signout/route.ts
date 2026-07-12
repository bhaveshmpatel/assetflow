import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Signed out successfully" }, { status: 200 });
  
  response.cookies.set({
    name: "session",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0), // Expire immediately
  });

  return response;
}
