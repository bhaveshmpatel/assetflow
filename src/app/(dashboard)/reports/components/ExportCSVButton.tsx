"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { getExportData } from "@/actions/report";

export function ExportCSVButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await getExportData();
      if (!result.success || !result.assets) {
        alert("Failed to fetch export data");
        return;
      }

      const headers = ["Asset Tag", "Name", "Category", "Department", "Status", "Location", "Serial Number", "Created At"];
      const rows = result.assets.map(asset => [
        asset.assetTag,
        asset.name,
        asset.category?.name || "Uncategorized",
        asset.department?.name || "Unassigned",
        asset.status,
        asset.location || "",
        asset.serialNumber || "",
        new Date(asset.createdAt).toISOString().split('T')[0]
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `asset-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      alert("Error exporting CSV");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleExport}
      disabled={isExporting}
      className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
    >
      {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
      {isExporting ? "Exporting..." : "Export CSV"}
    </Button>
  );
}
