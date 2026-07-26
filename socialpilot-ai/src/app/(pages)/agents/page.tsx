"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Bot, Activity, Cpu, Clock, CheckCircle2, AlertTriangle, Play,
  Pause, Settings, ChevronDown, Zap, Brain, TrendingUp, Search,
  Filter, RefreshCw, MoreHorizontal, Eye, BarChart2,
} from "lucide-react";
import { useAppStore, AgentItem } from "@/store/app-store";

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue:   { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE" },
  violet: { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" },
  emerald:{ bg: "#ECFDF5", text: "#059669", border: "#A7F3D0" },
  gold:   { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" },
  sky:    { bg: "#F0F9FF", text: "#0284C7", border: "#BAE6FD" },
};

const accentGradients: Record<string, string> = {
  blue:    "linear-gradient(90deg, #2563EB, #7C3AED)",
  violet:  "linear-gradient(90deg, #7C3AED, #EC4899)",
  emerald: "linear-gradient(90deg, #059669, #0284C7)",
  gold:    "linear-gradient(90deg, #D97706, #DC2626)",
  sky:     "linear-gradient(90deg, #0284C7, #059669)",
};

function AgentCard({ agent, index }: { agent: AgentItem; index: number }) {
  const { toggleAgent, triggerAgentTask } = useAppStore();
  const enabled = agent.status !== "idle";
  const colors = colorMap[agent.color] ?? colorMap.blue;

  const handleManualRun = () => {
    triggerAgentTask(agent.id, `Exec task: Generate content & optimize strategy`);
  };

  return (
    <motion.div
      className="agent-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <div className="accent-bar" style={{ background: accentGradients[agent.color] }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingTop: 6 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: colors.bg, border: `1px solid ${colors.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Bot size={18} color={colors.text} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0A0A0B" }}>{agent.name}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <motion.div
                className={`status-dot ${enabled ? "status-active" : "status-idle"}`}
                animate={enabled ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span style={{ fontSize: 11, fontWeight: 600, color: enabled ? "#059669" : "#94A3B8" }}>
                {enabled ? agent.status.toUpperCase() : "DISABLED"}
              </span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#71717A", margin: "3px 0 0", lineHeight: 1.4 }}>{agent.role}</p>
        </div>

        {/* Toggle */}
        <button
          onClick={() => toggleAgent(agent.id)}
          style={{
            width: 40, height: 22, borderRadius: 99, flexShrink: 0,
            background: enabled ? "#059669" : "#E4E4E7",
            border: "none", cursor: "pointer", position: "relative",
            transition: "background 0.25s",
          }}
        >
          <motion.div
            animate={{ x: enabled ? 20 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{
              width: 16, height: 16, borderRadius: "50%", background: "white",
              position: "absolute", top: 3,
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          />
        </button>
      </div>

      {/* Current Task */}
      <div style={{
        marginTop: 14, padding: "8px 10px",
        background: "#FAFAFA", border: "1px solid #F0F0F2",
        borderRadius: 10, fontSize: 12, color: "#52525B", lineHeight: 1.4,
      }}>
        <span style={{ fontWeight: 600, color: "#0A0A0B" }}>Now: </span>
        {agent.currentTask}
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12 }}>
        {[
          { label: "Health",   value: `${agent.health}%`,       icon: Activity },
          { label: "Success",  value: `${agent.successRate}%`,  icon: CheckCircle2 },
          { label: "Tasks",    value: agent.tasksCompleted.toLocaleString(), icon: BarChart2 },
        ].map(m => (
          <div key={m.label} style={{
            background: "#FAFAFA", border: "1px solid #F0F0F2",
            borderRadius: 10, padding: "8px 10px", textAlign: "center",
          }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0A0A0B", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {m.value}
            </div>
            <div style={{ fontSize: 10, color: "#A1A1AA", marginTop: 1 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <span style={{ fontSize: 11, color: "#A1A1AA" }}>
            <Clock size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
            {agent.lastRun}
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <motion.button
            className="btn btn-secondary btn-sm"
            style={{ padding: "4px 8px", fontSize: 11 }}
            onClick={handleManualRun}
            whileTap={{ scale: 0.95 }}
          >
            <Play size={11} /> Run Task
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function AgentsPage() {
  const { agents } = useAppStore();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = agents.filter(a => {
    const matchStatus = filter === "all" || (filter === "active" ? a.status !== "idle" : a.status === "idle");
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const activeCount = agents.filter(a => a.status !== "idle").length;
  const totalTasks = agents.reduce((s, a) => s + a.tasksCompleted, 0);
  const avgHealth = (agents.reduce((s, a) => s + a.health, 0) / agents.length).toFixed(1);

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div className="page-header" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0A0A0B", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.025em" }}>
              AI Agents Engine
            </h1>
            <p style={{ color: "#71717A", fontSize: 14, margin: "6px 0 0" }}>
              {activeCount} of {agents.length} agents active · {totalTasks.toLocaleString()} total tasks executed
            </p>
          </div>
        </div>

        {/* Summary KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 24 }}>
          {[
            { label: "Active Agents",    value: `${activeCount}/${agents.length}`, color: "#059669", bg: "#ECFDF5", icon: Bot },
            { label: "Avg Health",       value: `${avgHealth}%`,     color: "#2563EB", bg: "#EFF6FF", icon: Activity },
            { label: "Tasks Executed",   value: totalTasks.toLocaleString(), color: "#7C3AED", bg: "#F5F3FF", icon: TrendingUp },
            { label: "Avg Exec Time",    value: "1.8s",              color: "#D97706", bg: "#FFFBEB", icon: Clock },
          ].map((s, i) => {
            const SIcon = s.icon;
            return (
              <motion.div
                key={s.label}
                className="card"
                style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -2 }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <SIcon size={18} color={s.color} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#0A0A0B", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "#71717A" }}>{s.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div className="search-bar" style={{ width: 280 }}>
          <Search size={14} color="#A1A1AA" />
          <input placeholder="Search agents..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="tabs-list">
          {["all","active","idle"].map(f => (
            <button key={f} className={`tab-item ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)} style={{ textTransform: "capitalize" }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {filtered.map((agent, i) => (
          <AgentCard key={agent.id} agent={agent} index={i} />
        ))}
      </div>
    </div>
  );
}
