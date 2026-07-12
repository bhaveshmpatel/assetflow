"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function AssetSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const initialQuery = searchParams.get("q") || "";
  const initialStatus = searchParams.get("status") || "ALL";

  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus);

  const applyFilters = useCallback((q: string, s: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (q) params.set("q", q);
    else params.delete("q");

    if (s && s !== "ALL") params.set("status", s);
    else params.delete("status");

    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== initialQuery || status !== initialStatus) {
        applyFilters(query, status);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query, status, applyFilters, initialQuery, initialStatus]);

  return (
    <div className="flex flex-1 flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
      <div className="relative flex-1 max-w-md w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by tag, name, or serial..." 
          className="pl-9 bg-zinc-950/50 border-zinc-800 focus-visible:ring-emerald-500 text-zinc-200"
        />
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-zinc-900 border-zinc-700 text-zinc-400 py-1.5 px-3 flex items-center shrink-0 h-10">
          <Filter className="h-3.5 w-3.5 mr-1" /> Filters
        </Badge>
        <Select value={status} onValueChange={(val) => setStatus(val || "ALL")}>
          <SelectTrigger className="w-[140px] bg-zinc-950/50 border-zinc-800 text-zinc-200 h-10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="ALLOCATED">Allocated</SelectItem>
            <SelectItem value="UNDER_MAINTENANCE">Maintenance</SelectItem>
            <SelectItem value="RESERVED">Reserved</SelectItem>
            <SelectItem value="LOST">Lost</SelectItem>
            <SelectItem value="RETIRED">Retired</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
