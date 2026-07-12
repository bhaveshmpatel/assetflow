import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, Box } from "lucide-react";
import { AssetDialogs } from "./components/AssetDialogs";
import { AssetSearch } from "./components/AssetSearch";
import { EmptyState } from "@/components/ui/empty-state";
import { Prisma } from "@prisma/client";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PAGE_SIZE = 10;

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const query = typeof resolvedParams.q === "string" ? resolvedParams.q : undefined;
  const statusFilter = typeof resolvedParams.status === "string" ? resolvedParams.status : undefined;
  const pageParam = typeof resolvedParams.page === "string" ? parseInt(resolvedParams.page, 10) : 1;
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const whereClause: Prisma.AssetWhereInput = {};
  
  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { assetTag: { contains: query, mode: "insensitive" } },
      { serialNumber: { contains: query, mode: "insensitive" } }
    ];
  }

  if (statusFilter) {
    whereClause.status = statusFilter as any; // Cast correctly based on enum if needed, but let's just use as Prisma.EnumAssetStatusFilter or similar
  }

  const [totalAssets, assets, categories, departments] = await Promise.all([
    prisma.asset.count({ where: whereClause }),
    prisma.asset.findMany({
      where: whereClause,
      include: { category: true, department: true },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.assetCategory.findMany(),
    prisma.department.findMany()
  ]);

  const totalPages = Math.ceil(totalAssets / PAGE_SIZE);

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", page.toString());
    return `/assets?${params.toString()}`;
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "AVAILABLE": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "ALLOCATED": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "UNDER_MAINTENANCE": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default: return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full h-full flex flex-col p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Asset Directory</h1>
        <p className="text-zinc-400">Manage and track all organizational hardware and software assets.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 backdrop-blur-sm">
        <AssetSearch />
        
        <AssetDialogs categories={categories} departments={departments} />
      </div>

      <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden shadow-xl backdrop-blur-sm">
        {assets.length === 0 ? (
          <div className="p-8">
            <EmptyState 
              icon={Box}
              title="No assets found"
              description="You haven't added any assets yet, or none match your search criteria. Try adjusting your filters or register a new asset."
            />
          </div>
        ) : (
          <div className="flex flex-col">
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
                {assets.map((asset) => (
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
                ))}
              </TableBody>
            </Table>
            
            {totalPages > 1 && (
              <div className="p-4 border-t border-zinc-800">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href={currentPage > 1 ? getPageUrl(currentPage - 1) : "#"} 
                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const page = i + 1;
                      // Simple pagination: show all if few, or just surrounding pages
                      if (totalPages > 7 && (page < currentPage - 2 || page > currentPage + 2) && page !== 1 && page !== totalPages) {
                        if (page === currentPage - 3 || page === currentPage + 3) {
                          return <PaginationItem key={page}><span className="text-zinc-500 px-2">...</span></PaginationItem>;
                        }
                        return null;
                      }
                      
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink 
                            href={getPageUrl(page)} 
                            isActive={page === currentPage}
                            className={page === currentPage ? "bg-zinc-800 text-white border-zinc-700" : "text-zinc-400 hover:text-white"}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext 
                        href={currentPage < totalPages ? getPageUrl(currentPage + 1) : "#"} 
                        className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
