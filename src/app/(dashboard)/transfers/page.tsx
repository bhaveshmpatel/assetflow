import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TransferClient } from "./components/TransferClient";

export default async function TransfersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // Employees can view this page, but maybe they shouldn't be able to allocate directly.
  // The Server Actions will enforce this.

  const assets = await prisma.asset.findMany({
    include: {
      allocations: {
        include: {
          user: true,
          assignedBy: true,
          department: true,
        },
        orderBy: { checkoutDate: 'desc' }
      }
    },
    orderBy: { assetTag: 'asc' }
  });

  const users = await prisma.user.findMany({
    select: { id: true, name: true, employeeId: true, role: true },
    orderBy: { name: 'asc' }
  });

  const departments = await prisma.department.findMany({
    select: { id: true, name: true }
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Allocation & Transfer</h1>
        <p className="text-zinc-400">Manage asset assignments and request transfers.</p>
      </div>
      
      <TransferClient assets={assets} users={users} departments={departments} currentUserRole={user.role} />
    </div>
  );
}
