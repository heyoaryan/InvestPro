"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface Point {
  date: string;
  roi: number;
  directBonus: number;
  teamCommission: number;
}

const tooltipStyle = {
  backgroundColor: "#1a1a1a",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  color: "#e5e5e5",
  fontSize: "12px",
};

const labelStyle = { color: "#737373" };

export function EarningsChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gRoi" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34d399" stopOpacity={0.15}/>
            <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="gDirect" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.15}/>
            <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="gTeam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#c084fc" stopOpacity={0.15}/>
            <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
          </linearGradient>
        </defs>
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
          width={45}
        />
        <Tooltip
          formatter={(v: number, name: string) => [formatCurrency(v), name]}
          contentStyle={tooltipStyle}
          labelStyle={labelStyle}
          cursor={{ stroke: "rgba(255,255,255,0.06)" }}
        />
        <Legend
          wrapperStyle={{ fontSize: "12px", color: "#737373", paddingTop: "16px" }}
        />
        <Area type="monotone" dataKey="roi" name="Daily ROI" stroke="#34d399" fill="url(#gRoi)" strokeWidth={1.5} dot={false}/>
        <Area type="monotone" dataKey="directBonus" name="Direct Bonus" stroke="#818cf8" fill="url(#gDirect)" strokeWidth={1.5} dot={false}/>
        <Area type="monotone" dataKey="teamCommission" name="Team Commission" stroke="#c084fc" fill="url(#gTeam)" strokeWidth={1.5} dot={false}/>
      </AreaChart>
    </ResponsiveContainer>
  );
}
