"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { LogType } from "@prisma/client";
import { AlertCircle, CalendarCheck, CheckCircle2, Info, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function LogFeed({ initialLogs }: { initialLogs: any[] }) {
  const [filter, setFilter] = useState<string>("ALL");

  const filteredLogs = initialLogs.filter((log) => {
    if (filter === "ALL") return true;
    if (filter === "ALERTS" && log.type === LogType.ALERT) return true;
    if (filter === "APPROVALS" && log.type === LogType.APPROVAL) return true;
    if (filter === "BOOKINGS" && log.type === LogType.BOOKING) return true;
    return false;
  });

  const getLogConfig = (type: LogType) => {
    switch (type) {
      case LogType.ALERT:
        return { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" };
      case LogType.APPROVAL:
        return { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
      case LogType.BOOKING:
        return { icon: CalendarCheck, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" };
      default:
        return { icon: Info, color: "text-zinc-400", bg: "bg-zinc-800/50", border: "border-zinc-700/50" };
    }
  };

  return (
    <div className="flex-1 bg-zinc-950/50 rounded-xl border border-zinc-800 flex flex-col overflow-hidden">
      <Tabs defaultValue="ALL" onValueChange={setFilter} className="w-full h-full flex flex-col">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/40">
          <TabsList className="bg-zinc-950 border border-zinc-800">
            <TabsTrigger value="ALL" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">All Activity</TabsTrigger>
            <TabsTrigger value="ALERTS" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-red-400">Alerts</TabsTrigger>
            <TabsTrigger value="APPROVALS" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-400">Approvals</TabsTrigger>
            <TabsTrigger value="BOOKINGS" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-indigo-400">Bookings</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={filter} className="flex-1 overflow-y-auto p-0 m-0 relative">
          {filteredLogs.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
              No logs found for this category.
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {filteredLogs.map((log) => {
                const config = getLogConfig(log.type);
                const Icon = config.icon;
                
                return (
                  <div key={log.id} className="p-4 hover:bg-zinc-900/30 transition-colors flex gap-4 items-start group">
                    <div className={cn("p-2 rounded-lg border shrink-0 mt-0.5", config.bg, config.border)}>
                      <Icon className={cn("h-4 w-4", config.color)} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <p className={cn(
                          "text-sm font-medium leading-relaxed", 
                          log.type === LogType.ALERT ? "text-red-200" : "text-zinc-200"
                        )}>
                          {log.actionDescription}
                        </p>
                        <span className="text-xs text-zinc-500 shrink-0 whitespace-nowrap tabular-nums">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        {log.user ? (
                          <>
                            <span className="text-xs text-zinc-500">{log.user.name}</span>
                            <span className="h-1 w-1 rounded-full bg-zinc-700"></span>
                            <span className="text-xs text-zinc-600 font-mono">{log.user.employeeId}</span>
                          </>
                        ) : (
                          <span className="text-xs text-zinc-500 italic">System Automated</span>
                        )}
                        <ArrowRight className="h-3 w-3 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
