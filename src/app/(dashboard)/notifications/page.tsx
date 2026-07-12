import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LogFeed } from "./components/LogFeed";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // Fetch all logs, ordering by newest first
  // In a real app we might paginate this or slice the top 100
  const logs = await prisma.activityLog.findMany({
    include: {
      user: { select: { name: true, employeeId: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto h-full flex flex-col p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Activity Logs</h1>
        <p className="text-zinc-400">System-wide audit trail and real-time notifications.</p>
      </div>

      <LogFeed initialLogs={logs} />
    </div>
  );
}
