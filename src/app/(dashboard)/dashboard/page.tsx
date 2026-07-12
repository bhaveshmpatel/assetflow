import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Box, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  CalendarDays, 
  ArrowRightLeft, 
  Clock,
  Plus
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function DashboardPage() {
  const now = new Date();
  
  // Parallel Prisma Queries for KPIs
  const [
    assetsAvailable,
    assetsAllocated,
    maintenanceCount,
    activeBookings,
    pendingTransfers,
    overdueAllocations,
    recentActivity
  ] = await Promise.all([
    prisma.asset.count({ where: { status: "AVAILABLE" } }),
    prisma.asset.count({ where: { status: "ALLOCATED" } }),
    prisma.maintenanceRequest.count({ where: { status: { in: ["PENDING", "IN_PROGRESS", "TECHNICIAN_ASSIGNED"] } } }),
    prisma.booking.count({ 
      where: { 
        status: "CONFIRMED",
        startTime: { lte: now },
        endTime: { gte: now }
      } 
    }),
    prisma.transferRequest.count({ where: { status: "PENDING" } }),
    prisma.allocation.count({ 
      where: { 
        actualReturnDate: null,
        expectedReturnDate: { lt: now } 
      } 
    }),
    prisma.activityLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } }
    })
  ]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Dashboard overview</h1>
        <p className="text-zinc-400">Track and manage your enterprise resources globally.</p>
      </div>

      {/* Critical Alert Banner */}
      {overdueAllocations > 0 && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 flex items-center gap-4 text-red-200">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm font-medium">
            <strong className="text-red-400">{overdueAllocations} assets</strong> overdue for return - flagged for follow-up.
          </p>
          <Button variant="outline" className="ml-auto border-red-500/30 hover:bg-red-500/20 text-red-300 h-8 text-xs">
            Review Overdue
          </Button>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Assets Available</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{assetsAvailable}</div>
            <p className="text-xs text-zinc-500 mt-1">Ready for allocation</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Assets Allocated</CardTitle>
            <Box className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{assetsAllocated}</div>
            <p className="text-xs text-zinc-500 mt-1">Currently in use</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Active Bookings</CardTitle>
            <CalendarDays className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeBookings}</div>
            <p className="text-xs text-zinc-500 mt-1">Ongoing reservations</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Pending Transfers</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{pendingTransfers}</div>
            <p className="text-xs text-zinc-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Active Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{maintenanceCount}</div>
            <p className="text-xs text-zinc-500 mt-1">Undergoing repair/service</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Overdue Returns</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{overdueAllocations}</div>
            <p className="text-xs text-zinc-500 mt-1">Requires follow-up</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        {/* Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div>
            <h2 className="text-lg font-medium text-white mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/assets?action=register">
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all hover:scale-105">
                  <Plus className="mr-2 h-4 w-4" /> Register Asset
                </Button>
              </Link>
              <Link href="/bookings">
                <Button variant="outline" className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100">
                  <CalendarDays className="mr-2 h-4 w-4 text-purple-400" /> Book Resource
                </Button>
              </Link>
              <Link href="/maintenance">
                <Button variant="outline" className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100">
                  <Wrench className="mr-2 h-4 w-4 text-amber-400" /> Raise Request
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="lg:col-span-3 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-white">System Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-4">No recent activity.</p>
              ) : (
                recentActivity.map((log) => (
                  <div key={log.id} className="flex items-start gap-4">
                    <div className="mt-0.5 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-300 leading-snug">
                        {log.actionDescription}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                        <span>{log.user?.name || "System"}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(log.createdAt, { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
