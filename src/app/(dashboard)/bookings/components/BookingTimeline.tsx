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

  // Generate timeline hours 8 AM to 6 PM
  const START_HOUR = 8;
  const END_HOUR = 18;
  const TOTAL_HOURS = END_HOUR - START_HOUR;
  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => i + START_HOUR);

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
        
        <div className="p-4">
          {/* Header for asset */}
          <div className="flex">
            <div className="w-16 shrink-0"></div>
            <div className="flex-1 h-10 flex items-center justify-center text-sm font-medium text-zinc-400 border border-zinc-800 bg-zinc-900/50 rounded-t-lg border-b-0 shadow-sm relative z-10">
              {selectedAsset?.assetTag || 'Resource'}
            </div>
          </div>

          <div className="relative h-[700px] flex">
            {/* Timeline hours column (left) */}
            <div className="w-16 shrink-0 relative h-full">
              {hours.map(h => {
                const top = ((h - START_HOUR) / TOTAL_HOURS) * 100;
                return (
                  <div key={h} className="absolute w-full text-right pr-4 text-xs text-zinc-500 font-medium" style={{ top: `${top}%`, transform: 'translateY(-50%)' }}>
                    {h}:00
                  </div>
                );
              })}
            </div>

            {/* Timeline tracks (vertical) */}
            <div className="flex-1 relative bg-zinc-950/50 rounded-b-lg border border-zinc-800/50 overflow-hidden h-full">
              {/* Horizontal Grid lines */}
              {hours.map(h => {
                const top = ((h - START_HOUR) / TOTAL_HOURS) * 100;
                return (
                  <div key={h} className="absolute inset-x-0 border-t border-zinc-800/30 z-0" style={{ top: `${top}%` }}></div>
                );
              })}

              {/* Booking blocks */}
              <div className="absolute inset-0 z-10 mx-2">
                {bookingsForDate.map((booking: any) => {
                  const start = new Date(booking.startTime);
                  const end = new Date(booking.endTime);
                  
                  // Calculate position
                  const startHour = start.getHours() + (start.getMinutes() / 60);
                  const endHour = end.getHours() + (end.getMinutes() / 60);
                  
                  // Clamp between START_HOUR and END_HOUR
                  const clampedStart = Math.max(START_HOUR, Math.min(END_HOUR, startHour));
                  const clampedEnd = Math.max(START_HOUR, Math.min(END_HOUR, endHour));
                  
                  if (clampedEnd <= START_HOUR || clampedStart >= END_HOUR) return null;
                  
                  const top = ((clampedStart - START_HOUR) / TOTAL_HOURS) * 100;
                  const height = ((clampedEnd - clampedStart) / TOTAL_HOURS) * 100;

                  return (
                    <div 
                      key={booking.id}
                      className="absolute inset-x-0 rounded-md bg-indigo-500/20 border border-indigo-500/50 px-3 py-1.5 overflow-hidden hover:bg-indigo-500/30 transition-colors cursor-pointer shadow-sm flex flex-col"
                      style={{ top: `${top}%`, height: `${height}%` }}
                    >
                      <div className="text-xs font-semibold text-indigo-300 truncate">Booked - {booking.user?.name}</div>
                      <div className="text-[10px] text-indigo-400/90 truncate mt-0.5">
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
