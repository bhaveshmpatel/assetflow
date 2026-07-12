import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MaintenanceBoard } from "./components/MaintenanceBoard";
import { MaintenanceStatus } from "@prisma/client";

export default async function MaintenancePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const maintenanceRequests = await prisma.maintenanceRequest.findMany({
    include: {
      asset: { select: { assetTag: true, name: true } },
      reportedBy: { select: { name: true } },
      approvedBy: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' }
  });

  const columns = [
    { id: "PENDING", title: "Pending" },
    { id: "APPROVED", title: "Approved" },
    { id: "TECHNICIAN_ASSIGNED", title: "Technician Assigned" },
    { id: "IN_PROGRESS", title: "In Progress" },
    { id: "RESOLVED", title: "Resolved" },
  ];

  return (
    <div className="space-y-8 h-full flex flex-col p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Maintenance Board</h1>
        <p className="text-zinc-400">Track and manage asset repairs through the resolution pipeline.</p>
      </div>
      
      <MaintenanceBoard 
        initialRequests={maintenanceRequests} 
        columns={columns} 
        userRole={user.role} 
      />
    </div>
  );
}
