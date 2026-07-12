import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UtilizationChart } from "./components/UtilizationChart";
import { MaintenanceFrequencyChart } from "./components/MaintenanceFrequencyChart";
import { ExportCSVButton } from "./components/ExportCSVButton";
import { Button } from "@/components/ui/button";
import { Download, AlertCircle, Clock } from "lucide-react";

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user || user.role === "EMPLOYEE") redirect("/dashboard");

  // 1. Utilization by Department
  const deptAllocations = await prisma.allocation.groupBy({
    by: ['departmentId'],
    _count: { id: true },
    where: { departmentId: { not: null } }
  });
  
  const depts = await prisma.department.findMany({
    where: { id: { in: deptAllocations.map(d => d.departmentId as string) } },
    select: { id: true, name: true }
  });

  const utilizationData = deptAllocations.map(da => ({
    name: depts.find(d => d.id === da.departmentId)?.name || "Unknown",
    active: da._count.id
  }));

  // 2. Maintenance Frequency (mock 6 months)
  // In a real app we'd group by month using raw queries, but for Prisma we can fetch recent and process in memory if small, or mock the timeline shape.
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const recentMaintenance = await prisma.maintenanceRequest.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true }
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const maintenanceFreqMap = recentMaintenance.reduce((acc: Record<string, number>, req) => {
    const month = months[new Date(req.createdAt).getMonth()];
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const currentMonthIdx = new Date().getMonth();
  const maintenanceData = Array.from({ length: 6 }).map((_, i) => {
    const mIdx = (currentMonthIdx - 5 + i + 12) % 12;
    const month = months[mIdx];
    return { month, count: maintenanceFreqMap[month] || 0 };
  });

  // 3. Most used assets (by total bookings)
  const topAssets = await prisma.asset.findMany({
    include: { _count: { select: { bookings: true } } },
    orderBy: { bookings: { _count: 'desc' } },
    take: 3,
  });

  // 4. Idle assets (AVAILABLE and old updated date)
  const idleAssets = await prisma.asset.findMany({
    where: { status: 'AVAILABLE' },
    orderBy: { updatedAt: 'asc' },
    take: 3,
  });

  // 5. Assets needing maintenance (UNDER_MAINTENANCE)
  const maintenanceAssets = await prisma.asset.findMany({
    where: { status: 'UNDER_MAINTENANCE' },
    take: 3,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full h-full flex flex-col p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Reports & Analytics</h1>
          <p className="text-zinc-400">Data-dense insights into asset utilization and health.</p>
        </div>
        {/* We'll use a standard button that triggers a client-side print/export mock */}
        <ExportCSVButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UtilizationChart data={utilizationData} />
        <MaintenanceFrequencyChart data={maintenanceData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-950/50 border-zinc-800/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-zinc-100 text-lg">Most Used Assets</CardTitle>
            <CardDescription className="text-zinc-500">Highest booking frequency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topAssets.map(asset => (
              <div key={asset.id} className="flex justify-between items-center text-sm">
                <span className="text-zinc-300 font-medium">{asset.name}</span>
                <span className="text-indigo-400">{asset._count.bookings} bookings</span>
              </div>
            ))}
            {topAssets.length === 0 && <span className="text-zinc-600 text-sm">No data available</span>}
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/50 border-zinc-800/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-zinc-100 text-lg">Idle Assets</CardTitle>
            <CardDescription className="text-zinc-500">Available but unused</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {idleAssets.map(asset => {
              const daysIdle = Math.floor((Date.now() - new Date(asset.updatedAt).getTime()) / (1000 * 3600 * 24));
              return (
                <div key={asset.id} className="flex justify-between items-center text-sm">
                  <span className="text-zinc-300 font-medium truncate pr-2">{asset.name}</span>
                  <span className="text-amber-500/80 flex items-center shrink-0">
                    <Clock className="w-3.5 h-3.5 mr-1" /> {daysIdle}d idle
                  </span>
                </div>
              );
            })}
            {idleAssets.length === 0 && <span className="text-zinc-600 text-sm">No idle assets</span>}
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/50 border-red-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-zinc-100 text-lg text-red-400">Needs Attention</CardTitle>
            <CardDescription className="text-zinc-500">Currently under maintenance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {maintenanceAssets.map(asset => (
              <div key={asset.id} className="flex justify-between items-center text-sm">
                <span className="text-zinc-300 font-medium">{asset.name}</span>
                <span className="text-red-400 flex items-center">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" /> Flagged
                </span>
              </div>
            ))}
            {maintenanceAssets.length === 0 && <span className="text-zinc-600 text-sm">All clear</span>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
