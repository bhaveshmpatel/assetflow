"use client";

import { useState } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { Calendar as CalendarIcon, Clock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createBooking } from "@/actions/booking";

export function BookingTimeline({ assets }: { assets: any[] }) {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || "");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const selectedAsset = assets.find(a => a.id === selectedAssetId);
  const bookingsForDate = selectedAsset?.bookings.filter((b: any) => isSameDay(new Date(b.startTime), date)) || [];

  const handleBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("assetId", selectedAssetId);
    
    // Convert local time string to ISO for the selected date
    const startStr = formData.get("startTime") as string;
    const endStr = formData.get("endTime") as string;
    
    const start = new Date(date);
    const [startH, startM] = startStr.split(':');
    start.setHours(parseInt(startH), parseInt(startM), 0, 0);
    
    const end = new Date(date);
    const [endH, endM] = endStr.split(':');
    end.setHours(parseInt(endH), parseInt(endM), 0, 0);

    formData.set("startTime", start.toISOString());
    formData.set("endTime", end.toISOString());

    const result = await createBooking(formData);
    
    if (result.success) {
      toast.success("Booking Confirmed", { description: result.message });
      setIsDialogOpen(false);
    } else {
      toast.error("Booking Failed", { description: result.error });
    }
  };

  // Generate timeline hours 9 AM to 5 PM
  const hours = Array.from({ length: 9 }, (_, i) => i + 9);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 backdrop-blur-sm">
        <Popover>
          {/* @ts-ignore */}
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal bg-zinc-950 border-zinc-800 text-zinc-100 hover:bg-zinc-900",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-zinc-950 border-zinc-800" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              className="bg-zinc-950 text-zinc-100"
            />
          </PopoverContent>
        </Popover>

        <Select value={selectedAssetId} onValueChange={(v) => v && setSelectedAssetId(v)}>
          <SelectTrigger className="w-[280px] bg-zinc-950 border-zinc-800 text-zinc-100">
            <SelectValue placeholder="Select resource" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
            {assets.map(asset => (
              <SelectItem key={asset.id} value={asset.id}>
                {asset.name} ({asset.category?.name || 'Uncategorized'})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {/* @ts-ignore */}
          <DialogTrigger asChild>
            <Button className="ml-auto bg-indigo-600 hover:bg-indigo-500 text-white">
              <Plus className="h-4 w-4 mr-2" /> Book Slot
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-100">
            <DialogHeader>
              <DialogTitle>Book {selectedAsset?.name}</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Reserve this resource for {format(date, "PPP")}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleBook} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input type="time" name="startTime" required className="bg-zinc-900 border-zinc-800 [color-scheme:dark]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input type="time" name="endTime" required className="bg-zinc-900 border-zinc-800 [color-scheme:dark]" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Input name="purpose" required placeholder="Meeting, field work, etc." className="bg-zinc-900 border-zinc-800" />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">Confirm Booking</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center gap-2">
          <Clock className="h-4 w-4 text-zinc-400" />
          <h3 className="font-medium text-zinc-200">Daily Timeline</h3>
        </div>
        
        <div className="p-4 overflow-x-auto">
          <div className="min-w-[800px] relative">
            {/* Timeline header */}
            <div className="flex border-b border-zinc-800 pb-2 mb-4">
              <div className="w-20 shrink-0"></div>
              {hours.map(h => (
                <div key={h} className="flex-1 text-xs text-zinc-500 font-medium relative">
                  <span className="-translate-x-1/2 absolute">{h}:00</span>
                </div>
              ))}
            </div>

            {/* Timeline tracks */}
            <div className="relative h-20 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
              {/* Grid lines */}
              <div className="absolute inset-0 flex ml-20">
                {hours.map(h => (
                  <div key={h} className="flex-1 border-l border-zinc-800/30"></div>
                ))}
              </div>
              
              <div className="absolute inset-y-0 left-0 w-20 flex items-center justify-center text-sm font-medium text-zinc-400 border-r border-zinc-800 bg-zinc-900/50">
                {selectedAsset?.assetTag || 'Resource'}
              </div>

              {/* Booking blocks */}
              <div className="absolute inset-y-2 left-20 right-0">
                {bookingsForDate.map((booking: any) => {
                  const start = new Date(booking.startTime);
                  const end = new Date(booking.endTime);
                  
                  // Calculate position (9AM = 0%, 5PM = 100%)
                  const startHour = start.getHours() + (start.getMinutes() / 60);
                  const endHour = end.getHours() + (end.getMinutes() / 60);
                  
                  // Clamp between 9 and 17
                  const clampedStart = Math.max(9, Math.min(17, startHour));
                  const clampedEnd = Math.max(9, Math.min(17, endHour));
                  
                  if (clampedEnd <= 9 || clampedStart >= 17) return null;
                  
                  const left = ((clampedStart - 9) / 8) * 100;
                  const width = ((clampedEnd - clampedStart) / 8) * 100;

                  return (
                    <div 
                      key={booking.id}
                      className="absolute inset-y-0 rounded bg-indigo-500/20 border border-indigo-500/50 px-2 flex flex-col justify-center overflow-hidden hover:bg-indigo-500/30 transition-colors cursor-pointer group"
                      style={{ left: `${left}%`, width: `${width}%` }}
                    >
                      <div className="text-xs font-semibold text-indigo-300 truncate">Booked - {booking.user?.name}</div>
                      <div className="text-[10px] text-indigo-400/80 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                        {format(start, "HH:mm")} - {format(end, "HH:mm")} | {booking.purpose}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
