"use client";

import { motion } from "framer-motion";
import { Cpu, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { ProviderStatus } from "../types/ai-types";

interface Props {
  providers: ProviderStatus[];
  selectedProvider: string;
  onSelectProvider: (providerId: string) => void;
}

export function ProviderSelectionCard({ providers, selectedProvider, onSelectProvider }: Props) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
      {providers.map((p) => {
        const isSelected = selectedProvider === p.provider_id;
        return (
          <motion.div
            key={p.provider_id}
            onClick={() => onSelectProvider(p.provider_id)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: 20,
              borderRadius: 14,
              border: isSelected ? "2px solid #2563EB" : "1px solid #EAE4DC",
              background: isSelected ? "#F0F6FF" : "#FFFFFF",
              cursor: "pointer",
              position: "relative",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: isSelected ? "#2563EB" : "#F4F4F5", color: isSelected ? "#FFFFFF" : "#18181B", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Cpu size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#18181B" }}>{p.name}</h3>
                  <div style={{ fontSize: 11, color: "#71717A" }}>Default: {p.default_model}</div>
                </div>
              </div>
              {isSelected && <ShieldCheck size={20} color="#2563EB" />}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #F0F0F2", fontSize: 12 }}>
              <span style={{ color: "#71717A" }}>{p.supported_models.length} Models</span>
              {p.is_configured ? (
                <span style={{ color: "#059669", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                  <CheckCircle size={12} /> Configured
                </span>
              ) : (
                <span style={{ color: "#D97706", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                  <AlertTriangle size={12} /> Key Required
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
