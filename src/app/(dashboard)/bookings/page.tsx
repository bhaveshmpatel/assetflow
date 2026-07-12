import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BookingTimeline } from "./components/BookingTimeline";

export default async function BookingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const assets = await prisma.asset.findMany({
    include: {
      category: true,
      bookings: {
        include: { user: true },
        where: { status: "CONFIRMED" },
      }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full h-full flex flex-col p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Resource Booking</h1>
        <p className="text-zinc-400">Reserve shared assets, rooms, and vehicles.</p>
      </div>
      
      <BookingTimeline assets={assets} />
    </div>
  );
}
