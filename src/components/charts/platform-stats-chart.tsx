"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface Point { date: string; invested: number; paidOut: number; }

const tooltipStyle = {
  backgroundColor: "#1a1a1a",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  color: "#e5e5e5",
  fontSize: "12px",
};

const labelStyle = { color: "#737373" };

export function PlatformStatsChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#525252" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#525252" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
          width={50}
        />
        <Tooltip
          formatter={(v: number, name: string) => [formatCurrency(v), name]}
          contentStyle={tooltipStyle}
          labelStyle={labelStyle}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
        />
        <Bar dataKey="invested" name="Invested" fill="#6366f1" radius={[3,3,0,0]} maxBarSize={24}/>
        <Bar dataKey="paidOut" name="Paid Out" fill="#34d399" radius={[3,3,0,0]} maxBarSize={24}/>
      </BarChart>
    </ResponsiveContainer>
  );
}
