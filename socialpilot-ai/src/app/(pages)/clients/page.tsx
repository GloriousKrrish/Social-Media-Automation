"use client";

import { motion } from "framer-motion";
import { clients } from "@/lib/mock-data";
import { Building2, Plus, BarChart2, Globe, Settings, ArrowUpRight, Users, TrendingUp } from "lucide-react";

export default function ClientsPage() {
  return (
    <div className="page-container">
      <motion.div className="page-header" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0A0A0B", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.025em" }}>
              Client Management
            </h1>
            <p style={{ color: "#71717A", fontSize: 14, margin: "6px 0 0" }}>
              Manage {clients.length} client workspaces with separate branding and billing
            </p>
          </div>
          <motion.button className="btn btn-primary" whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
            <Plus size={14} /> Add Client
          </motion.button>
        </div>

        {/* Agency Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 24 }}>
          {[
            { label: "Total Clients",   value: clients.length,                               icon: Building2, color: "#2563EB", bg: "#EFF6FF" },
            { label: "Active Accounts", value: clients.reduce((a, c) => a + c.accounts, 0), icon: Globe,     color: "#7C3AED", bg: "#F5F3FF" },
            { label: "Posts This Month",value: clients.reduce((a, c) => a + c.posts, 0).toLocaleString(), icon: TrendingUp, color: "#059669", bg: "#ECFDF5" },
            { label: "Revenue",         value: "$48,200",                                   icon: BarChart2, color: "#D97706", bg: "#FFFBEB" },
          ].map((s, i) => {
            const SIcon = s.icon;
            return (
              <motion.div
                key={s.label}
                className="card"
                style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -2 }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <SIcon size={18} color={s.color} />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#0A0A0B", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.03em" }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "#71717A" }}>{s.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: 16 }}>
        {clients.map((client, i) => (
          <motion.div
            key={client.id}
            className="card"
            style={{ padding: "20px 24px", cursor: "pointer" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -2 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "white", fontSize: 14, fontWeight: 800 }}>{client.logo}</span>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#0A0A0B" }}>{client.name}</span>
                  <span className={`badge ${client.plan === "Enterprise" ? "badge-violet" : "badge-blue"}`} style={{ fontSize: 10 }}>
                    {client.plan}
                  </span>
                  <span className="badge badge-emerald" style={{ fontSize: 10 }}>Active</span>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <span style={{ fontSize: 12, color: "#71717A" }}>
                    <Globe size={10} style={{ display: "inline", marginRight: 4 }} />{client.accounts} accounts
                  </span>
                  <span style={{ fontSize: 12, color: "#71717A" }}>
                    <TrendingUp size={10} style={{ display: "inline", marginRight: 4 }} />{client.posts.toLocaleString()} posts
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <motion.button className="btn btn-secondary btn-sm" whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}>
                  <BarChart2 size={13} /> Analytics
                </motion.button>
                <motion.button className="btn btn-secondary btn-sm" whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}>
                  <Settings size={13} /> Manage
                </motion.button>
                <motion.button className="btn btn-primary btn-sm" whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}>
                  Open <ArrowUpRight size={12} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
