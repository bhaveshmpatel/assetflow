"use client";

import { useState, useTransition } from "react";
import { Check, ChevronsUpDown, Loader2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

import { createAllocation, createTransferRequest, getAssetDetails } from "@/actions/allocation";

type AssetBasic = { id: string, assetTag: string, name: string, status: string };
type UserBasic = { id: string, name: string, department: { name: string } | null };

export function AllocationForm({ 
  assets, 
  users, 
  departments 
}: { 
  assets: AssetBasic[], 
  users: UserBasic[],
  departments: { id: string, name: string }[]
}) {
  const [open, setOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [assetDetails, setAssetDetails] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  const handleAssetSelect = async (assetId: string) => {
    setSelectedAssetId(assetId);
    setOpen(false);
    
    startTransition(async () => {
      const result = await getAssetDetails(assetId);
      if (result.success) {
        setAssetDetails(result.data);
      } else {
        toast.error(result.error);
        setAssetDetails(null);
      }
    });
  };

  const selectedAssetBasic = assets.find((a) => a.id === selectedAssetId);

  const handleAllocateSubmit = async (formData: FormData) => {
    formData.append("assetId", selectedAssetId);
    
    const result = await createAllocation(formData);
    if (result.success) {
      toast.success(result.message);
      handleAssetSelect(selectedAssetId); // refresh
    } else {
      toast.error(result.error);
    }
  };

  const handleTransferSubmit = async (formData: FormData) => {
    if (!assetDetails?.currentAllocation) return;
    formData.append("allocationId", assetDetails.currentAllocation.id);
    
    const result = await createTransferRequest(formData);
    if (result.success) {
      toast.success(result.message);
      handleAssetSelect(selectedAssetId); // refresh
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-8 bg-zinc-900/40 p-6 rounded-xl border border-zinc-800">
      
      {/* 1. The Asset Selector */}
      <div className="space-y-2 flex flex-col">
        <Label className="text-zinc-300">Select Asset</Label>
        <Popover open={open} onOpenChange={setOpen}>
          {/* @ts-ignore */}
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between bg-zinc-950 border-zinc-800 text-zinc-200 h-12"
            >
              {selectedAssetId
                ? `${selectedAssetBasic?.assetTag} - ${selectedAssetBasic?.name}`
                : "Search by tag or name..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-zinc-950 border-zinc-800">
            <Command className="bg-transparent">
              <CommandInput placeholder="Search assets..." className="text-zinc-200" />
              <CommandList>
                <CommandEmpty>No asset found.</CommandEmpty>
                <CommandGroup>
                  {assets.map((asset) => (
                    <CommandItem
                      key={asset.id}
                      value={`${asset.assetTag} ${asset.name}`}
                      onSelect={() => handleAssetSelect(asset.id)}
                      className="text-zinc-200 aria-selected:bg-zinc-800 aria-selected:text-white"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 text-emerald-500",
                          selectedAssetId === asset.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="font-mono text-zinc-400 mr-2">{asset.assetTag}</span>
                      {asset.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {isPending && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      )}

      {/* 2. Conditional Business Logic & UI State */}
      {!isPending && assetDetails && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* STATE A: AVAILABLE */}
          {assetDetails.status === "AVAILABLE" && (
            <div className="space-y-4">
              <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 mb-4 border-emerald-500/20">
                Status: Available
              </Badge>
              <form action={handleAllocateSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 flex flex-col">
                    <Label htmlFor="targetUserId" className="text-zinc-300">Allocate To Employee</Label>
                    <Select name="targetUserId" required>
                      <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-200 h-11 focus:ring-emerald-500">
                        <SelectValue placeholder="Select an employee..." />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200 max-h-[300px]">
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} {u.department ? `(${u.department.name})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 flex flex-col">
                    <Label htmlFor="expectedReturnDate" className="text-zinc-300">Expected Return Date</Label>
                    <Input 
                      type="date" 
                      id="expectedReturnDate" 
                      name="expectedReturnDate" 
                      className="bg-zinc-950 border-zinc-800 text-zinc-200 h-11 focus-visible:ring-emerald-500" 
                    />
                  </div>
                </div>

                <div className="space-y-2 flex flex-col">
                  <Label htmlFor="conditionNotes" className="text-zinc-300">Condition Notes</Label>
                  <Textarea 
                    id="conditionNotes" 
                    name="conditionNotes" 
                    placeholder="E.g., Minor scratch on the lid..." 
                    className="bg-zinc-950 border-zinc-800 text-zinc-200 resize-none focus-visible:ring-emerald-500" 
                  />
                </div>

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  Allocate Asset
                </Button>
              </form>
            </div>
          )}

          {/* STATE B: ALLOCATED (Double-Allocation Block) */}
          {assetDetails.status === "ALLOCATED" && (
            <div className="space-y-6">
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-400">
                <AlertTriangle className="h-4 w-4 !text-red-400" />
                <AlertTitle>Double-Allocation Blocked</AlertTitle>
                <AlertDescription className="mt-2 text-red-200">
                  Already Allocated to <strong>{assetDetails.currentAllocation?.user?.name}</strong> 
                  {assetDetails.currentAllocation?.user?.department?.name && ` (${assetDetails.currentAllocation?.user?.department?.name})`}. 
                  Direct re-allocation is blocked - submit a transfer request below.
                </AlertDescription>
              </Alert>

              <form action={handleTransferSubmit} className="space-y-6 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 flex flex-col">
                    <Label className="text-zinc-300">From (Current Holder)</Label>
                    <Input 
                      disabled 
                      value={assetDetails.currentAllocation?.user?.name || "Unknown"} 
                      className="bg-zinc-950/50 border-zinc-800 text-zinc-500 h-11" 
                    />
                  </div>
                  
                  <div className="space-y-2 flex flex-col">
                    <Label htmlFor="targetUserId" className="text-zinc-300">To (Target Employee)</Label>
                    <Select name="targetUserId" required>
                      <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-200 h-11 focus:ring-emerald-500">
                        <SelectValue placeholder="Select an employee..." />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200 max-h-[300px]">
                        {users.filter(u => u.id !== assetDetails.currentAllocation?.user?.id).map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} {u.department ? `(${u.department.name})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 flex flex-col">
                  <Label htmlFor="managerNotes" className="text-zinc-300">Transfer Reason</Label>
                  <Textarea 
                    id="managerNotes" 
                    name="managerNotes" 
                    required
                    placeholder="E.g., Employee re-assigned to new project..." 
                    className="bg-zinc-950 border-zinc-800 text-zinc-200 resize-none focus-visible:ring-emerald-500" 
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                  Submit Transfer Request
                </Button>
              </form>
            </div>
          )}

          {/* OTHER STATES */}
          {assetDetails.status !== "AVAILABLE" && assetDetails.status !== "ALLOCATED" && (
            <Alert className="bg-zinc-900 border-zinc-800 text-zinc-300">
              <AlertTitle>Asset Unavailable</AlertTitle>
              <AlertDescription className="mt-2">
                This asset cannot be allocated or transferred. Current status: <Badge variant="outline" className="ml-2 font-mono">{assetDetails.status}</Badge>
              </AlertDescription>
            </Alert>
          )}

          {/* 3. Allocation History Timeline */}
          <Separator className="bg-zinc-800" />
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-400">Allocation history</h3>
            {assetDetails.history && assetDetails.history.length > 0 ? (
              <div className="space-y-4 pl-2 border-l-2 border-zinc-800">
                {assetDetails.history.map((record: any) => (
                  <div key={record.id} className="relative pl-4">
                    <div className="absolute -left-[11px] top-1.5 h-2 w-2 rounded-full bg-zinc-600 ring-4 ring-zinc-900" />
                    <p className="text-sm text-zinc-300">
                      <span className="text-zinc-500 font-mono text-xs mr-2">
                        {format(new Date(record.checkoutDate), "MMM dd, yyyy")}
                      </span>
                      Allocated to <span className="font-medium text-zinc-200">{record.user?.name}</span>
                      {record.user?.department?.name && ` - ${record.user.department.name}`}
                      {record.actualReturnDate && (
                        <span className="block text-zinc-500 mt-1">
                          Returned: {format(new Date(record.actualReturnDate), "MMM dd, yyyy")}
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 italic">No previous allocations recorded.</p>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
