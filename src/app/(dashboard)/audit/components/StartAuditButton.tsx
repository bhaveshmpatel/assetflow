"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { startAuditCycle } from "@/actions/audit";
import { toast } from "sonner";
import { Play } from "lucide-react";
import { useRouter } from "next/navigation";

export function StartAuditButton() {
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    setIsStarting(true);
    const date = new Date();
    const title = `Organization Audit - ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    
    const res = await startAuditCycle(title);
    
    if (res?.success) {
      toast.success("Audit Started", { description: res.message });
      router.refresh();
    } else {
      toast.error("Failed to Start Audit", { description: res?.error });
      setIsStarting(false);
    }
  };

  return (
    <Button 
      onClick={handleStart} 
      disabled={isStarting}
      className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
    >
      <Play className="h-4 w-4" />
      {isStarting ? "Starting..." : "Start New Audit"}
    </Button>
  );
}
