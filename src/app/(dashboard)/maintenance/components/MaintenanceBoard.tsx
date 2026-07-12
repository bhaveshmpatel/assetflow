"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { updateMaintenanceStatus } from "@/actions/maintenance";
import { toast } from "sonner";
import { MaintenanceStatus, Prisma, Role } from "@prisma/client";
import { Wrench, Clock, CheckCircle2, UserCircle2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

type MaintenanceRequestPayload = Prisma.MaintenanceRequestGetPayload<{
  include: { asset: true, reportedBy: true, approvedBy: true }
}>;

interface BoardColumn {
  id: MaintenanceStatus;
  title: string;
}

export function MaintenanceBoard({ initialRequests, columns, userRole }: { initialRequests: MaintenanceRequestPayload[], columns: BoardColumn[], userRole: string }) {
  const [requests, setRequests] = useState(initialRequests);
  const [isMounted, setIsMounted] = useState(false);

  const isReadOnly = userRole === "EMPLOYEE";

  useEffect(() => {
    setIsMounted(true);
    setRequests(initialRequests);
  }, [initialRequests]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || isReadOnly) return;
    
    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return; // Same column

    const newStatus = destination.droppableId as MaintenanceStatus;
    
    // Optimistic UI update
    setRequests(prev => prev.map(req => 
      req.id === draggableId ? { ...req, status: newStatus } : req
    ));

    const res = await updateMaintenanceStatus(draggableId, newStatus);
    
    if (res.success) {
      toast.success("Status Updated", { description: `Moved to ${newStatus.replace('_', ' ')}` });
    } else {
      toast.error("Update Failed", { description: res.error });
      // Revert optimistic update
      setRequests(initialRequests);
    }
  };

  if (!isMounted) {
    return <div className="flex-1 flex items-center justify-center text-zinc-500">Loading Kanban board...</div>;
  }

  return (
    <div className="flex-1 overflow-x-auto pb-4">
      {requests.length === 0 ? (
        <EmptyState 
          icon={Wrench}
          title="No maintenance requests"
          description="There are currently no assets under maintenance. New maintenance requests will appear here when an asset is flagged for repair."
          className="mt-8 mx-auto max-w-2xl"
        />
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex h-full min-h-[500px] gap-4">
          {columns.map(column => {
            const columnRequests = requests.filter(r => r.status === column.id);
            
            return (
              <div key={column.id} className="flex flex-col min-w-[300px] max-w-[300px] bg-zinc-900/40 rounded-xl border border-zinc-800/80 overflow-hidden">
                <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
                  <h3 className="font-semibold text-zinc-200 text-sm">{column.title}</h3>
                  <span className="bg-zinc-800 text-zinc-400 text-xs py-0.5 px-2 rounded-full">{columnRequests.length}</span>
                </div>
                
                <Droppable droppableId={column.id} isDropDisabled={isReadOnly}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.droppableProps}
                      className={cn(
                        "flex-1 p-3 space-y-3 min-h-[150px] transition-colors",
                        snapshot.isDraggingOver ? "bg-zinc-800/30" : ""
                      )}
                    >
                      {columnRequests.map((request, index) => (
                        <Draggable key={request.id} draggableId={request.id} index={index} isDragDisabled={isReadOnly}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                "bg-zinc-950 p-4 rounded-lg border border-zinc-800 shadow-sm cursor-grab active:cursor-grabbing",
                                snapshot.isDragging ? "shadow-xl border-zinc-600 rotate-2 scale-105 z-50 ring-1 ring-emerald-500/50" : "hover:border-zinc-700",
                                isReadOnly && "cursor-default hover:border-zinc-800"
                              )}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-mono text-emerald-400/90 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                  {request.asset.assetTag}
                                </span>
                                {request.status === "RESOLVED" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                              </div>
                              <h4 className="text-zinc-100 font-medium text-sm mb-1">{request.asset.name}</h4>
                              <p className="text-zinc-400 text-xs line-clamp-2 mb-3 leading-relaxed">
                                {request.description}
                              </p>
                              <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-800/50">
                                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                  <UserCircle2 className="h-3.5 w-3.5" />
                                  <span className="truncate max-w-[100px]">{request.reportedBy.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{new Date(request.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
        </DragDropContext>
      )}
    </div>
  );
}
