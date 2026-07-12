import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { AssetDialogs } from "./components/AssetDialogs";

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const query = typeof resolvedParams.q === "string" ? resolvedParams.q : undefined;
  const statusFilter = typeof resolvedParams.status === "string" ? resolvedParams.status : undefined;

  const whereClause: any = {};
  
  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { assetTag: { contains: query, mode: "insensitive" } },
      { serialNumber: { contains: query, mode: "insensitive" } }
    ];
  }

  if (statusFilter) {
    whereClause.status = statusFilter;
  }

  const [assets, categories, departments] = await Promise.all([
    prisma.asset.findMany({
      where: whereClause,
      include: { category: true, department: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.assetCategory.findMany(),
    prisma.department.findMany()
  ]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case "AVAILABLE": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "ALLOCATED": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "UNDER_MAINTENANCE": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default: return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Asset Directory</h1>
        <p className="text-zinc-400">Manage and track all organizational hardware and software assets.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 backdrop-blur-sm">
        <div className="flex flex-1 items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <form action="/assets" method="GET">
              <Input 
                name="q"
                defaultValue={query}
                placeholder="Search by tag, name, or serial..." 
                className="pl-9 bg-zinc-950/50 border-zinc-800 focus-visible:ring-emerald-500 text-zinc-200"
              />
              {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
            </form>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-zinc-900 border-zinc-700 text-zinc-400 py-1.5 px-3">
              <Filter className="h-3.5 w-3.5 mr-1" /> Filters
            </Badge>
          </div>
        </div>
        
        <AssetDialogs categories={categories} departments={departments} />
      </div>

      <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden shadow-xl backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-zinc-900/80">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 font-medium">Tag</TableHead>
              <TableHead className="text-zinc-400 font-medium">Name</TableHead>
              <TableHead className="text-zinc-400 font-medium">Category</TableHead>
              <TableHead className="text-zinc-400 font-medium">Department</TableHead>
              <TableHead className="text-zinc-400 font-medium">Status</TableHead>
              <TableHead className="text-zinc-400 font-medium text-right">Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.length === 0 ? (
              <TableRow className="border-zinc-800 hover:bg-zinc-800/20">
                <TableCell colSpan={6} className="text-center py-12 text-zinc-500">
                  No assets found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset) => (
                <TableRow key={asset.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                  <TableCell className="font-mono text-xs text-zinc-300">{asset.assetTag}</TableCell>
                  <TableCell className="font-medium text-zinc-200">{asset.name}</TableCell>
                  <TableCell className="text-zinc-400">{asset.category.name}</TableCell>
                  <TableCell className="text-zinc-400">{asset.department?.name || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-normal ${getStatusColor(asset.status)}`}>
                      {asset.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-zinc-400">{asset.location || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
