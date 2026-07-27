"use client";

import { AIHistoryRecord } from "../types/ai-types";
import { Clock, Cpu, CheckCircle2, XCircle } from "lucide-react";

interface Props {
  history: AIHistoryRecord[];
  isLoading?: boolean;
}

export function AIHistoryTable({ history, isLoading }: Props) {
  if (isLoading) {
    return <div style={{ fontSize: 13, color: "#71717A", padding: 20 }}>Loading AI generation logs...</div>;
  }

  if (!history || history.length === 0) {
    return <div style={{ fontSize: 13, color: "#71717A", fontStyle: "italic", padding: 20 }}>No AI history recorded yet.</div>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #EAE4DC", color: "#71717A", fontSize: 12 }}>
            <th style={{ padding: "10px 12px" }}>Prompt</th>
            <th style={{ padding: "10px 12px" }}>Provider</th>
            <th style={{ padding: "10px 12px" }}>Model</th>
            <th style={{ padding: "10px 12px" }}>Latency</th>
            <th style={{ padding: "10px 12px" }}>Status</th>
            <th style={{ padding: "10px 12px" }}>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.id} style={{ borderBottom: "1px solid #F4F4F5" }}>
              <td style={{ padding: "12px", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500, color: "#18181B" }}>
                {h.prompt}
              </td>
              <td style={{ padding: "12px", color: "#52525B" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, textTransform: "capitalize" }}>
                  <Cpu size={12} /> {h.provider}
                </span>
              </td>
              <td style={{ padding: "12px", color: "#52525B" }}>{h.model}</td>
              <td style={{ padding: "12px", color: "#52525B" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Clock size={12} /> {h.latency_ms} ms
                </span>
              </td>
              <td style={{ padding: "12px" }}>
                {h.status === "success" ? (
                  <span style={{ color: "#059669", background: "#ECFDF5", padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle2 size={10} /> Success
                  </span>
                ) : (
                  <span style={{ color: "#DC2626", background: "#FEF2F2", padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <XCircle size={10} /> {h.status}
                  </span>
                )}
              </td>
              <td style={{ padding: "12px", color: "#A1A1AA", fontSize: 11 }}>{new Date(h.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
