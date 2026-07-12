import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ActionCenter } from "./components/ActionCenter";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // Fetch pending transfer requests
  const transferRequests = await prisma.transferRequest.findMany({
    where: { status: "PENDING" },
    include: {
      allocation: {
        include: {
          asset: true,
          user: true,
        }
      },
      targetUser: true,
      requestedBy: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch pending maintenance requests
  const maintenanceRequests = await prisma.maintenanceRequest.findMany({
    where: { status: "PENDING" },
    include: {
      asset: true,
      reportedBy: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch all logs
  const logs = await prisma.activityLog.findMany({
    include: {
      user: { select: { name: true, employeeId: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto h-full flex flex-col pt-4 md:pt-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Action Center</h1>
        <p className="text-zinc-400">Manage pending requests and review system activity.</p>
      </div>

      <ActionCenter 
        transferRequests={transferRequests}
        maintenanceRequests={maintenanceRequests}
        logs={logs}
        userRole={user.role}
        currentUserId={user.id}
      />
    </div>
  );
}
