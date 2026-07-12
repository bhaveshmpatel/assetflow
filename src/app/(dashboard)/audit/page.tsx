import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AuditClient } from "./components/AuditClient";
import { AuditStatus } from "@prisma/client";

export default async function AuditPage() {
  const user = await getCurrentUser();
  if (!user || user.role === "EMPLOYEE") redirect("/dashboard");

  const activeAudit = await prisma.auditCycle.findFirst({
    where: { status: AuditStatus.ACTIVE },
    include: {
      initiatedBy: { select: { name: true } },
      auditItems: {
        include: {
          asset: {
            select: { id: true, assetTag: true, name: true, location: true }
          }
        }
      }
    },
    orderBy: { startDate: 'desc' }
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto h-full flex flex-col p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Asset Audit</h1>
        <p className="text-zinc-400">Structured verification interface for physical asset audits.</p>
      </div>

      {activeAudit ? (
        <AuditClient activeAudit={activeAudit} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <p className="text-zinc-400">No active audit cycles found.</p>
        </div>
      )}
    </div>
  );
}
