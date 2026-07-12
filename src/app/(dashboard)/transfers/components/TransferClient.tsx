"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, AlertTriangle, ArrowRightLeft, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createAllocation, createTransferRequest } from "@/actions/allocation";
import { Prisma, Role } from "@prisma/client";

type AssetWithRelations = Prisma.AssetGetPayload<{
  include: {
    allocations: {
      include: {
        user: true,
        assignedBy: true,
        department: true,
      },
    }
  }
}>;

type UserPayload = Prisma.UserGetPayload<{
  select: { id: true, name: true, employeeId: true, role: true }
}>;

type DepartmentPayload = Prisma.DepartmentGetPayload<{}>;

interface TransferClientProps {
  assets: AssetWithRelations[];
  users: UserPayload[];
  departments: DepartmentPayload[];
  currentUserRole: Role;
}

export function TransferClient({ assets, users, departments, currentUserRole }: TransferClientProps) {
  const [open, setOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState("");

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);

  const handleAllocate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("assetId", selectedAssetId);
    
    const result = await createAllocation(formData);
    if (result.success) {
      toast.success("Success", { description: result.message });
      setSelectedAssetId("");
    } else {
      toast.error("Error", { description: result.error });
    }
  };

  const handleTransfer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (!selectedAsset) return;
    formData.append("allocationId", selectedAsset.allocations[0]?.id);
    
    const result = await createTransferRequest(formData);
    if (result.success) {
      toast.success("Transfer Requested", { description: result.message });
      setSelectedAssetId("");
    } else {
      toast.error("Error", { description: result.error });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-zinc-100">Select Asset</CardTitle>
          <CardDescription className="text-zinc-400">Search by Asset Tag or Name</CardDescription>
        </CardHeader>
        <CardContent>
          <Popover open={open} onOpenChange={setOpen}>
            {/* @ts-ignore */}
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white"
              >
                {selectedAsset
                  ? `${selectedAsset.assetTag} - ${selectedAsset.name}`
                  : "Search for an asset..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0 bg-zinc-950 border-zinc-800">
              <Command className="bg-zinc-950">
                <CommandInput placeholder="Search assets..." className="text-zinc-200" />
                <CommandList>
                  <CommandEmpty>No asset found.</CommandEmpty>
                  <CommandGroup>
                    {assets.map((asset) => (
                      <CommandItem
                        key={asset.id}
                        value={`${asset.assetTag} ${asset.name}`}
                        onSelect={() => {
                          setSelectedAssetId(asset.id);
                          setOpen(false);
                        }}
                        className="text-zinc-300 aria-selected:bg-zinc-800 aria-selected:text-white"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedAssetId === asset.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {asset.assetTag} - {asset.name}
                        <Badge variant="outline" className="ml-auto bg-zinc-900 border-zinc-700 text-xs">
                          {asset.status}
                        </Badge>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {selectedAsset && selectedAsset.status === "AVAILABLE" && (
        <Card className="bg-emerald-950/20 border-emerald-900/50">
          <CardHeader>
            <CardTitle className="text-emerald-400">Allocate Asset</CardTitle>
            <CardDescription className="text-zinc-400">Assign this available asset to a user or department.</CardDescription>
          </CardHeader>
          <CardContent>
            {currentUserRole === "EMPLOYEE" ? (
              <p className="text-zinc-400 text-sm">You do not have permission to allocate assets directly.</p>
            ) : (
              <form onSubmit={handleAllocate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetUserId" className="text-zinc-300">Assign To (User)</Label>
                    <Select name="targetUserId" required>
                      <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-100">
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id} label={u.name} className="text-zinc-200">{u.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departmentId" className="text-zinc-300">Department (Optional)</Label>
                    <Select name="departmentId">
                      <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-100">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        <SelectItem value="" className="text-zinc-400">None</SelectItem>
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={d.id} label={d.name} className="text-zinc-200">{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedReturnDate" className="text-zinc-300">Expected Return Date</Label>
                  <Input type="datetime-local" name="expectedReturnDate" className="bg-zinc-900 border-zinc-800 text-zinc-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conditionNotes" className="text-zinc-300">Condition Notes</Label>
                  <Textarea name="conditionNotes" placeholder="Any scratches or issues prior to handover?" className="bg-zinc-900 border-zinc-800 text-zinc-100" />
                </div>
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">Allocate Now</Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {selectedAsset && selectedAsset.status === "ALLOCATED" && (
        <Card className="bg-red-950/20 border-red-900/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-400">Asset is Unavailable</CardTitle>
            </div>
            <CardDescription className="text-red-300/80 mt-1">
              Already Allocated to <strong className="text-red-300">{selectedAsset.allocations[0]?.user?.name || "Unknown"}</strong> {selectedAsset.allocations[0]?.department ? `(${selectedAsset.allocations[0].department.name})` : ""}. Direct re-allocation is blocked.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTransfer} className="space-y-4 p-4 rounded-lg bg-red-950/10 border border-red-900/30">
              <div className="flex items-center gap-3 text-sm font-medium text-zinc-300 mb-2">
                <ArrowRightLeft className="h-4 w-4" /> Request Transfer
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400">From</Label>
                  <Input disabled value={selectedAsset.allocations[0]?.user?.name || "Unknown"} className="bg-zinc-950 border-zinc-800 text-zinc-500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetUserId" className="text-zinc-300">To (Target Employee)</Label>
                  <Select name="targetUserId" required>
                    <SelectTrigger className="bg-zinc-900 border-red-900/50 text-zinc-100">
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id} label={u.name} className="text-zinc-200">{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="managerNotes" className="text-zinc-300">Reason for Transfer</Label>
                <Textarea name="managerNotes" required placeholder="Why is this transfer needed?" className="bg-zinc-900 border-red-900/50 text-zinc-100" />
              </div>
              <Button type="submit" variant="destructive" className="w-full bg-red-600/80 hover:bg-red-600 text-white">Submit Transfer Request</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {selectedAsset && selectedAsset.status !== "AVAILABLE" && selectedAsset.status !== "ALLOCATED" && (
        <Card className="bg-amber-950/20 border-amber-900/50">
          <CardHeader>
            <CardTitle className="text-amber-400">Asset is {selectedAsset.status}</CardTitle>
            <CardDescription className="text-zinc-400">This asset cannot be allocated or transferred in its current state.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {selectedAsset && (
        <Card className="bg-zinc-900/30 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Clock className="h-4 w-4" /> Allocation History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
              {selectedAsset.allocations.length === 0 ? (
                <p className="text-center text-sm text-zinc-500 py-4 relative z-10">No allocation history available.</p>
              ) : (
                selectedAsset.allocations.map((alloc) => (
                  <div key={alloc.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-zinc-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-zinc-800 bg-zinc-900/50 shadow">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-zinc-200 text-sm">Assigned to {alloc.user?.name}</div>
                        <time className="text-xs font-medium text-emerald-500">{new Date(alloc.checkoutDate).toLocaleDateString()}</time>
                      </div>
                      <div className="text-xs text-zinc-400">
                        By {alloc.assignedBy?.name} {alloc.actualReturnDate ? `| Returned ${new Date(alloc.actualReturnDate).toLocaleDateString()}` : ''}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
