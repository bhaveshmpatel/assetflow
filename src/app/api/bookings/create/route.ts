import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createBookingSchema = z.object({
  assetId: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  purpose: z.string().min(3),
});

export async function POST(request: Request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = createBookingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input data", details: result.error.format() },
        { status: 400 }
      );
    }

    const { assetId, startTime, endTime, purpose } = result.data;
    const requestedStart = new Date(startTime);
    const requestedEnd = new Date(endTime);

    if (requestedStart >= requestedEnd) {
      return NextResponse.json(
        { error: "Start time must be before end time" },
        { status: 400 }
      );
    }

    // Atomic database check for overlapping bookings
    // Overlap condition: requestedStart < existingEnd AND requestedEnd > existingStart
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        assetId: assetId,
        status: "CONFIRMED",
        AND: [
          { startTime: { lt: requestedEnd } },
          { endTime: { gt: requestedStart } },
        ],
      },
      include: {
        user: { select: { name: true } },
      },
    });

    if (conflictingBooking) {
      return NextResponse.json(
        {
          error: "Conflict",
          message: `This asset is already booked during the requested time by ${
            conflictingBooking.user?.name || "another user"
          }.`,
          conflictingUser: conflictingBooking.user?.name,
        },
        { status: 409 }
      );
    }

    // If no conflict, create the booking
    const newBooking = await prisma.booking.create({
      data: {
        assetId,
        userId,
        startTime: requestedStart,
        endTime: requestedEnd,
        purpose,
        status: "CONFIRMED",
      },
    });

    return NextResponse.json(
      { message: "Booking confirmed", booking: newBooking },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
