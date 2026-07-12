"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const bookingSchema = z.object({
  assetId: z.string().min(1, "Resource is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  purpose: z.string().min(3, "Purpose must be at least 3 characters"),
});

export async function createBooking(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const data = {
      assetId: formData.get("assetId") as string,
      startTime: formData.get("startTime") as string,
      endTime: formData.get("endTime") as string,
      purpose: formData.get("purpose") as string,
    };

    const validated = bookingSchema.parse(data);
    const requestedStart = new Date(validated.startTime);
    const requestedEnd = new Date(validated.endTime);

    if (requestedStart >= requestedEnd) {
      return { success: false, error: "Start time must be before end time" };
    }

    const result = await prisma.$transaction(async (tx) => {
      // Check for overlap
      const conflictingBooking = await tx.booking.findFirst({
        where: {
          assetId: validated.assetId,
          status: "CONFIRMED",
          AND: [
            { startTime: { lt: requestedEnd } },
            { endTime: { gt: requestedStart } },
          ],
        },
        include: { user: { select: { name: true } } },
      });

      if (conflictingBooking) {
        throw new Error(`Conflict - slot is unavailable. Currently booked by ${conflictingBooking.user?.name || "another user"}.`);
      }

      const newBooking = await tx.booking.create({
        data: {
          assetId: validated.assetId,
          userId: user.id,
          startTime: requestedStart,
          endTime: requestedEnd,
          purpose: validated.purpose,
          status: "CONFIRMED",
        },
      });

      await tx.activityLog.create({
        data: {
          userId: user.id,
          type: "BOOKING",
          actionDescription: `Booked resource (ID: ${validated.assetId}) for ${requestedStart.toLocaleDateString()}`,
        }
      });

      return newBooking;
    });

    revalidatePath("/bookings");
    return { success: true, message: "Resource booked successfully." };
  } catch (error: any) {
    if (error instanceof z.ZodError) return { success: false, error: (error as any).errors[0].message };
    return { success: false, error: error.message || "Failed to create booking." };
  }
}
