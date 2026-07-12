"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function UtilizationChart({ data }: { data: { name: string, active: number }[] }) {
  return (
    <Card className="bg-zinc-950/80 border-zinc-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-zinc-100">Utilization by Department</CardTitle>
        <CardDescription className="text-zinc-500">Active allocations across the organization</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#52525b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#52525b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                cursor={{ fill: '#27272a', opacity: 0.4 }}
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                itemStyle={{ color: '#818cf8' }}
              />
              <Bar 
                dataKey="active" 
                fill="#4f46e5" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
