"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";
import {
  Send, CalendarDays, Bot, Activity, Link, Zap, Globe, Heart,
  TrendingUp, TrendingDown, ArrowUpRight, RefreshCw, MoreHorizontal,
  CheckCircle2, AlertCircle, Info, Clock, Sparkles, Eye,
} from "lucide-react";
import { kpiData, engagementData, followerGrowthData, contentScoreData, recentActivity, scheduledPosts } from "@/lib/mock-data";
import { staggerContainer } from "@/lib/animations";
import { formatNumber } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";

const iconMap: Record<string, React.ElementType> = {
  send: Send, calendar: CalendarDays, bot: Bot, activity: Activity,
  link: Link, zap: Zap, globe: Globe, heart: Heart,
};

const colorMap: Record<string, { bg: string; icon: string; text: string }> = {
  blue:   { bg: "#EFF6FF", icon: "#2563EB", text: "#2563EB" },
  violet: { bg: "#F5F3FF", icon: "#7C3AED", text: "#7C3AED" },
  emerald:{ bg: "#ECFDF5", icon: "#059669", text: "#059669" },
  gold:   { bg: "#FFFBEB", icon: "#D97706", text: "#D97706" },
  sky:    { bg: "#F0F9FF", icon: "#0284C7", text: "#0284C7" },
};

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, value);
      setCount(Math.floor(current));
      if (current >= value) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <>{formatNumber(count)}{suffix}</>;
}

function KPICard({ item, index }: { item: typeof kpiData[0]; index: number }) {
  const Icon = iconMap[item.icon] ?? Activity;
  const colors = colorMap[item.color] ?? colorMap.blue;
  const isPositive = item.change > 0;

  return (
    <motion.div
      className={`kpi-card ${item.color}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
    >
      <div className="kpi-icon" style={{ background: colors.bg }}>
        <Icon size={20} color={colors.icon} strokeWidth={2} />
      </div>
      <div className="kpi-value">
        <AnimatedCounter value={item.value} suffix={item.suffix} />
      </div>
      <div className="kpi-label">{item.label}</div>
      <div className={`kpi-change ${isPositive ? "positive" : "negative"}`}>
        {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        {isPositive ? "+" : ""}{item.change}{typeof item.change === "number" && Math.abs(item.change) < 10 && item.suffix !== "%" ? "" : ""}
        <span style={{ opacity: 0.7, fontSize: 10 }}> vs last month</span>
      </div>
    </motion.div>
  );
}

const platformColors: Record<string, string> = {
  linkedin: "#2563EB",
  instagram: "#E1306C",
  twitter: "#000000",
  facebook: "#1877F2",
};

const statusIcon: Record<string, React.ElementType> = {
  success: CheckCircle2,
  warning: AlertCircle,
  info: Info,
};
const statusColor: Record<string, string> = {
  success: "#059669",
  warning: "#D97706",
  info: "#2563EB",
};
const statusBg: Record<string, string> = {
  success: "#ECFDF5",
  warning: "#FFFBEB",
  info: "#EFF6FF",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const userName = user?.full_name ? user.full_name.split(" ")[0] : "User";

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0A0A0B", margin: 0, letterSpacing: "-0.025em", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Welcome back, {userName} 👋
            </h1>
            <p style={{ color: "#71717A", fontSize: 14, marginTop: 6, margin: "6px 0 0" }}>
              Your AI agents published <strong style={{ color: "#059669" }}>23 posts</strong> while you were away. Here&apos;s your performance overview.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <motion.button className="btn btn-secondary" whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
              <RefreshCw size={14} /> Refresh
            </motion.button>
            <motion.button className="btn btn-primary" whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
              <Sparkles size={14} /> New Campaign
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div
        className="kpi-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {kpiData.map((item, i) => (
          <KPICard key={item.id} item={item} index={i} />
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Engagement Chart */}
        <motion.div
          className="card"
          style={{ padding: 24 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0A0A0B" }}>Engagement Overview</h3>
              <p style={{ fontSize: 12, color: "#71717A", margin: "3px 0 0" }}>Last 7 months across platforms</p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["linkedin","instagram","twitter","facebook"].map(p => (
                <div key={p} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: platformColors[p] }} />
                  <span style={{ fontSize: 11, color: "#71717A", textTransform: "capitalize" }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={engagementData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <defs>
                {["linkedin","instagram","twitter","facebook"].map(p => (
                  <linearGradient key={p} id={`grad-${p}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={platformColors[p]} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={platformColors[p]} stopOpacity={0.01} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#A1A1AA" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#A1A1AA" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #E4E4E7", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                labelStyle={{ fontWeight: 600, fontSize: 13 }}
              />
              {["linkedin","instagram","twitter","facebook"].map(p => (
                <Area key={p} type="monotone" dataKey={p} stroke={platformColors[p]} strokeWidth={2}
                  fill={`url(#grad-${p})`} dot={false} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Follower Growth */}
        <motion.div
          className="card"
          style={{ padding: 24 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0A0A0B" }}>Follower Growth</h3>
              <p style={{ fontSize: 12, color: "#71717A", margin: "3px 0 0" }}>Total followers across all accounts</p>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#059669", background: "#ECFDF5", padding: "4px 10px", borderRadius: 99 }}>
              +94% <TrendingUp size={11} style={{ display: "inline", verticalAlign: "middle" }} />
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={followerGrowthData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="grad-followers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#A1A1AA" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#A1A1AA" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E4E4E7", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }} />
              <Line type="monotone" dataKey="followers" stroke="#2563EB" strokeWidth={2.5}
                dot={{ r: 4, fill: "#2563EB", strokeWidth: 2, stroke: "white" }}
                activeDot={{ r: 6, fill: "#2563EB" }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 20 }}>
        {/* Recent AI Activity */}
        <motion.div
          className="card"
          style={{ padding: 24 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#0A0A0B" }}>AI Agent Activity</h3>
            <button className="btn btn-ghost btn-sm" style={{ fontSize: 12, color: "#71717A" }}>
              View all <ArrowUpRight size={12} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentActivity.map((act, i) => {
              const SIcon = statusIcon[act.status] ?? Info;
              return (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.06 }}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "10px 12px", borderRadius: 12,
                    background: "#FAFAFA", border: "1px solid #F0F0F2",
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: statusBg[act.status],
                  }}>
                    <SIcon size={14} color={statusColor[act.status]} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0A0A0B" }}>{act.agent}</div>
                    <div style={{ fontSize: 12, color: "#71717A", marginTop: 1 }}>{act.action}: <span style={{ color: "#0A0A0B", fontWeight: 500 }}>{act.target}</span></div>
                  </div>
                  <div style={{ fontSize: 11, color: "#A1A1AA", whiteSpace: "nowrap", flexShrink: 0 }}>{act.time}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Scheduled Posts */}
        <motion.div
          className="card"
          style={{ padding: 24 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.4 }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#0A0A0B" }}>Upcoming Posts</h3>
            <Clock size={16} color="#71717A" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {scheduledPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.85 + i * 0.06 }}
                style={{
                  padding: "10px 12px", borderRadius: 12,
                  border: "1px solid #F0F0F2", background: "white",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 8px",
                    borderRadius: 99, textTransform: "capitalize",
                    background: post.status === "scheduled" ? "#ECFDF5" : post.status === "pending_approval" ? "#FFFBEB" : "#F4F4F5",
                    color: post.status === "scheduled" ? "#059669" : post.status === "pending_approval" ? "#D97706" : "#71717A",
                  }}>
                    {post.status.replace("_", " ")}
                  </span>
                  <span style={{ fontSize: 10, color: "#A1A1AA", textTransform: "capitalize" }}>{post.platform}</span>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0A0A0B", lineHeight: 1.3 }}>{post.title}</div>
                <div style={{ fontSize: 11, color: "#A1A1AA", marginTop: 4 }}>{post.scheduledAt}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Content Score Radar */}
        <motion.div
          className="card"
          style={{ padding: 24 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#0A0A0B" }}>Content Score</h3>
            <p style={{ fontSize: 12, color: "#71717A", margin: "3px 0 0" }}>AI-powered quality analysis</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
            <div style={{
              fontSize: 36, fontWeight: 900, color: "#2563EB",
              fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.04em",
            }}>
              86<span style={{ fontSize: 18, color: "#A1A1AA" }}>/100</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={contentScoreData}>
              <PolarGrid stroke="#F0F0F2" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#71717A" }} />
              <Radar name="Score" dataKey="value" stroke="#2563EB" fill="#2563EB" fillOpacity={0.12} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
            {contentScoreData.map(d => (
              <div key={d.subject} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div className="progress-bar" style={{ height: 4 }}>
                  <motion.div
                    className="progress-fill"
                    style={{ background: "#2563EB", width: 0 }}
                    animate={{ width: `${d.value}%` }}
                    transition={{ delay: 1, duration: 0.8 }}
                  />
                </div>
                <span style={{ fontSize: 10, color: "#71717A", whiteSpace: "nowrap" }}>{d.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
