"use client";

import { useState, useTransition } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2, ArrowRight, Wrench, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { LogFeed } from "./LogFeed";

import { 
  approveTransferRequest, 
  rejectTransferRequest, 
  approveMaintenanceRequest, 
  rejectMaintenanceRequest 
} from "@/actions/requests";

type UserRole = "ADMIN" | "ASSET_MANAGER" | "DEPARTMENT_HEAD" | "EMPLOYEE";

export function ActionCenter({ 
  transferRequests, 
  maintenanceRequests, 
  logs, 
  userRole,
  currentUserId
}: { 
  transferRequests: any[], 
  maintenanceRequests: any[],
  logs: any[],
  userRole: UserRole,
  currentUserId: string
}) {
  const [isPending, startTransition] = useTransition();

  const isManager = userRole === "ADMIN" || userRole === "ASSET_MANAGER";
  
  // Employees only see requests relevant to them (either they requested it, or they are the target)
  const visibleTransfers = isManager ? transferRequests : transferRequests.filter(r => r.requestedById === currentUserId || r.targetUserId === currentUserId);
  const visibleMaintenance = isManager ? maintenanceRequests : maintenanceRequests.filter(r => r.reportedById === currentUserId);

  const pendingCount = visibleTransfers.length + visibleMaintenance.length;

  const handleApproveTransfer = (id: string) => {
    startTransition(async () => {
      const res = await approveTransferRequest(id);
      if (res.success) toast.success(res.message);
      else toast.error(res.error);
    });
  };

  const handleRejectTransfer = (id: string) => {
    startTransition(async () => {
      const res = await rejectTransferRequest(id);
      if (res.success) toast.success(res.message);
      else toast.error(res.error);
    });
  };

  const handleApproveMaintenance = (id: string) => {
    startTransition(async () => {
      const res = await approveMaintenanceRequest(id);
      if (res.success) toast.success(res.message);
      else toast.error(res.error);
    });
  };

  const handleRejectMaintenance = (id: string) => {
    startTransition(async () => {
      const res = await rejectMaintenanceRequest(id);
      if (res.success) toast.success(res.message);
      else toast.error(res.error);
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue={pendingCount > 0 ? "actions" : "logs"} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-zinc-900 border-zinc-800">
          <TabsTrigger value="actions" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
            Action Required
            {pendingCount > 0 && (
              <Badge className="ml-2 bg-indigo-600 hover:bg-indigo-600">{pendingCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
            Activity Logs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="actions" className="mt-6 space-y-6">
          {pendingCount === 0 && (
            <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
              <p className="text-zinc-500">You have no pending requests to review.</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {/* TRANSFER REQUESTS */}
            {visibleTransfers.map(req => (
              <Card key={req.id} className="bg-zinc-950 border-zinc-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium flex items-center text-zinc-100">
                      <RefreshCw className="mr-2 h-4 w-4 text-blue-500" />
                      Transfer Request
                    </CardTitle>
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>
                  </div>
                  <CardDescription className="text-zinc-400">
                    Requested on {format(new Date(req.createdAt), "MMM d, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-zinc-900/50 p-3 rounded-md border border-zinc-800/50">
                      <div className="flex flex-col">
                        <span className="text-xs text-zinc-500">Asset</span>
                        <span className="text-sm font-medium text-zinc-200">
                          {req.allocation.asset.assetTag} - {req.allocation.asset.name}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 py-2">
                      <div className="flex-1">
                        <p className="text-xs text-zinc-500">From</p>
                        <p className="text-sm font-medium text-zinc-300">{req.allocation.user?.name || "System"}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-zinc-600" />
                      <div className="flex-1">
                        <p className="text-xs text-zinc-500">To</p>
                        <p className="text-sm font-medium text-zinc-300">{req.targetUser.name}</p>
                      </div>
                    </div>

                    {req.managerNotes && (
                      <div className="bg-zinc-900/50 p-3 rounded-md border border-zinc-800/50">
                        <p className="text-xs text-zinc-500 mb-1">Reason / Notes</p>
                        <p className="text-sm text-zinc-300 italic">"{req.managerNotes}"</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                {isManager && (
                  <CardFooter className="flex justify-end gap-3 pt-0">
                    <Button 
                      variant="outline" 
                      onClick={() => handleRejectTransfer(req.id)}
                      disabled={isPending}
                      className="border-zinc-700 text-zinc-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                    >
                      <X className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button 
                      onClick={() => handleApproveTransfer(req.id)}
                      disabled={isPending}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                      Approve Transfer
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}

            {/* MAINTENANCE REQUESTS */}
            {visibleMaintenance.map(req => (
              <Card key={req.id} className="bg-zinc-950 border-zinc-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium flex items-center text-zinc-100">
                      <Wrench className="mr-2 h-4 w-4 text-orange-500" />
                      Maintenance Request
                    </CardTitle>
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>
                  </div>
                  <CardDescription className="text-zinc-400">
                    Reported by {req.reportedBy.name} on {format(new Date(req.createdAt), "MMM d, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-zinc-900/50 p-3 rounded-md border border-zinc-800/50">
                      <div className="flex flex-col">
                        <span className="text-xs text-zinc-500">Asset</span>
                        <span className="text-sm font-medium text-zinc-200">
                          {req.asset.assetTag} - {req.asset.name}
                        </span>
                      </div>
                    </div>
                    <div className="bg-zinc-900/50 p-3 rounded-md border border-zinc-800/50">
                      <p className="text-xs text-zinc-500 mb-1">Issue Description</p>
                      <p className="text-sm text-zinc-300">"{req.description}"</p>
                    </div>
                  </div>
                </CardContent>
                {isManager && (
                  <CardFooter className="flex justify-end gap-3 pt-0">
                    <Button 
                      variant="outline" 
                      onClick={() => handleRejectMaintenance(req.id)}
                      disabled={isPending}
                      className="border-zinc-700 text-zinc-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                    >
                      <X className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button 
                      onClick={() => handleApproveMaintenance(req.id)}
                      disabled={isPending}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                      Approve Maintenance
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <LogFeed initialLogs={logs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
