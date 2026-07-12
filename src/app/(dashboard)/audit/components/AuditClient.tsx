"use client";

import { useState } from "react";
import { AuditItemCondition } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";
import { closeAuditCycle } from "@/actions/audit";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Prisma } from "@prisma/client";

type AuditCyclePayload = Prisma.AuditCycleGetPayload<{
  include: {
    initiatedBy: true,
    auditItems: {
      include: {
        asset: true
      }
    }
  }
}>;

export function AuditClient({ activeAudit }: { activeAudit: AuditCyclePayload }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemStates, setItemStates] = useState<Record<string, AuditItemCondition>>(
    activeAudit.auditItems.reduce((acc, item) => {
      acc[item.id] = item.condition || "VERIFIED";
      return acc;
    }, {} as Record<string, AuditItemCondition>)
  );

  const discrepancies = Object.values(itemStates).filter(s => s !== "VERIFIED").length;

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    const payload = Object.entries(itemStates).map(([auditItemId, condition]) => {
      const item = activeAudit.auditItems.find((i) => i.id === auditItemId);
      return {
        auditItemId,
        condition,
        assetId: item!.assetId
      };
    });

    const result = await closeAuditCycle(activeAudit.id, payload);
    
    if (result.success) {
      toast.success("Audit Completed", { description: result.message });
      router.refresh();
    } else {
      toast.error("Error", { description: result.error });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-emerald-950/30 border border-emerald-900/50 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-zinc-100 font-medium">{activeAudit.title}</h3>
            <p className="text-zinc-400 text-sm">Initiated by {activeAudit.initiatedBy.name} • {new Date(activeAudit.startDate).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-zinc-100">{activeAudit.auditItems.length}</div>
          <div className="text-zinc-500 text-xs uppercase tracking-wider">Total Items</div>
        </div>
      </div>

      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-900/80 text-zinc-400 text-xs uppercase border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-medium">Asset</th>
              <th className="px-6 py-4 font-medium">Expected Location</th>
              <th className="px-6 py-4 font-medium text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {activeAudit.auditItems.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-900/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-zinc-200">{item.asset.name}</div>
                  <div className="text-zinc-500 font-mono text-xs mt-0.5">{item.asset.assetTag}</div>
                </td>
                <td className="px-6 py-4 text-zinc-400">
                  {item.asset.location || "Unknown"}
                </td>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setItemStates(prev => ({ ...prev, [item.id]: "VERIFIED" }))}
                      className={cn(
                        "flex items-center h-8 px-3 rounded-full text-xs font-medium border border-transparent transition-all",
                        itemStates[item.id] === "VERIFIED" 
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30 hover:text-emerald-300" 
                          : "bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                      )}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      Verified
                    </button>
                    <button
                      onClick={() => setItemStates(prev => ({ ...prev, [item.id]: "MISSING" }))}
                      className={cn(
                        "flex items-center h-8 px-3 rounded-full text-xs font-medium border border-transparent transition-all",
                        itemStates[item.id] === "MISSING" 
                          ? "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30 hover:text-red-300" 
                          : "bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                      )}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1.5" />
                      Missing
                    </button>
                    <button
                      onClick={() => setItemStates(prev => ({ ...prev, [item.id]: "DAMAGED" }))}
                      className={cn(
                        "flex items-center h-8 px-3 rounded-full text-xs font-medium border border-transparent transition-all",
                        itemStates[item.id] === "DAMAGED" 
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30 hover:text-amber-300" 
                          : "bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                      )}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                      Damaged
                    </button>
                  </div>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-zinc-800 sticky bottom-4 shadow-2xl">
        <div className="flex items-center gap-3">
          {discrepancies > 0 ? (
            <>
              <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </div>
              <span className="text-red-400 font-medium text-sm">
                {discrepancies} asset{discrepancies > 1 ? 's' : ''} flagged - discrepancy report generated automatically
              </span>
            </>
          ) : (
            <>
              <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-emerald-400 font-medium text-sm">All assets verified successfully</span>
            </>
          )}
        </div>
        <Button 
          onClick={handleComplete} 
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-500 text-white min-w-[160px]"
        >
          {isSubmitting ? "Processing..." : "Close audit cycle"}
        </Button>
      </div>
    </div>
  );
}
