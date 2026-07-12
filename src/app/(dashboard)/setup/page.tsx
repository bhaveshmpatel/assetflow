import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SetupDialogs } from "./components/SetupDialogs"; // We'll extract client components here

export default async function SetupPage() {
  const user = await getCurrentUser();
  
  if (!user) redirect("/sign-in");
  
  // Strict Server-Side RBAC
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch Data
  const [departments, users] = await Promise.all([
    prisma.department.findMany({
      include: { manager: { select: { name: true } }, _count: { select: { users: true } } },
      orderBy: { name: "asc" }
    }),
    prisma.user.findMany({
      where: { role: { in: ["ADMIN", "DEPARTMENT_HEAD", "ASSET_MANAGER"] } },
      select: { id: true, name: true, role: true }
    })
  ]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Organization Setup</h1>
          <p className="text-zinc-400">Manage departments, roles, and core administrative settings.</p>
        </div>
      </div>

      <Tabs defaultValue="departments" className="flex-1 flex flex-col">
        <TabsList className="bg-zinc-900/50 border border-zinc-800 self-start">
          <TabsTrigger value="departments" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50 text-zinc-400">Departments</TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50 text-zinc-400">Asset Categories</TabsTrigger>
          <TabsTrigger value="employees" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50 text-zinc-400">Employees</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="flex-1 mt-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden shadow-xl backdrop-blur-sm">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <h2 className="font-medium text-white">Department Directory</h2>
              <SetupDialogs type="department" users={users} />
            </div>
            
            <Table>
              <TableHeader className="bg-zinc-900/80">
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400 font-medium h-10">Department Name</TableHead>
                  <TableHead className="text-zinc-400 font-medium h-10">Head Manager</TableHead>
                  <TableHead className="text-zinc-400 font-medium h-10">Members</TableHead>
                  <TableHead className="text-zinc-400 font-medium h-10 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.length === 0 ? (
                  <TableRow className="border-zinc-800 hover:bg-zinc-800/20 transition-colors">
                    <TableCell colSpan={4} className="text-center py-8 text-zinc-500">No departments configured yet.</TableCell>
                  </TableRow>
                ) : (
                  departments.map((dept) => (
                    <TableRow key={dept.id} className="border-zinc-800 hover:bg-zinc-800/20 transition-colors">
                      <TableCell className="font-medium text-zinc-200 py-3">{dept.name}</TableCell>
                      <TableCell className="text-zinc-400 py-3">{dept.manager?.name || <span className="text-zinc-600 italic">Unassigned</span>}</TableCell>
                      <TableCell className="text-zinc-400 py-3">{dept._count.users}</TableCell>
                      <TableCell className="text-right py-3">
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-normal">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="flex-1 mt-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 text-center">
            <p className="text-zinc-500 mb-4">Category management view is under construction.</p>
            <Badge variant="outline" className="bg-zinc-800 text-zinc-400 border-zinc-700">Coming Soon</Badge>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="flex-1 mt-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 text-center">
            <p className="text-zinc-500 mb-4">Employee directory and role management view is under construction.</p>
            <Badge variant="outline" className="bg-zinc-800 text-zinc-400 border-zinc-700">Coming Soon</Badge>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
