"use client";

import { AIUsageStat } from "../types/ai-types";
import { Activity, Zap, CheckCircle2, Clock } from "lucide-react";

interface Props {
  stats?: AIUsageStat;
}

export function AIUsageStatsCard({ stats }: Props) {
  const total = stats?.total_requests || 0;
  const success = stats?.successful_generations || 0;
  const successRate = total > 0 ? round((success / total) * 100) : 100;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
      <div style={{ padding: 16, borderRadius: 12, background: "#FAFAFA", border: "1px solid #EAE4DC" }}>
        <div style={{ fontSize: 12, color: "#71717A", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <Activity size={14} /> Total Requests
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#18181B" }}>{total}</div>
      </div>

      <div style={{ padding: 16, borderRadius: 12, background: "#FAFAFA", border: "1px solid #EAE4DC" }}>
        <div style={{ fontSize: 12, color: "#71717A", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <CheckCircle2 size={14} color="#059669" /> Success Rate
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#059669" }}>{successRate}%</div>
      </div>

      <div style={{ padding: 16, borderRadius: 12, background: "#FAFAFA", border: "1px solid #EAE4DC" }}>
        <div style={{ fontSize: 12, color: "#71717A", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <Clock size={14} /> Avg Latency
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#18181B" }}>{stats?.average_latency_ms || 0} ms</div>
      </div>

      <div style={{ padding: 16, borderRadius: 12, background: "#FAFAFA", border: "1px solid #EAE4DC" }}>
        <div style={{ fontSize: 12, color: "#71717A", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <Zap size={14} color="#2563EB" /> Tokens Processed
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#2563EB" }}>{stats?.total_tokens_used || 0}</div>
      </div>
    </div>
  );
}

function round(val: number): number {
  return Math.round(val);
}
