"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, TrendingDown, Users, Heart, Eye, MousePointer2,
  Share2, MessageCircle, ArrowUpRight, Sparkles, BarChart2,
  Calendar, Download, RefreshCw, Filter,
} from "lucide-react";
import { engagementData, followerGrowthData, heatmapData } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";

const platformPerf = [
  { platform: "LinkedIn",  reach: 840000, engagement: 8.4, posts: 142, color: "#0077B5" },
  { platform: "Instagram", reach: 1240000,engagement: 6.1, posts: 198, color: "#E1306C" },
  { platform: "Twitter",   reach: 520000, engagement: 3.8, posts: 312, color: "#000000" },
  { platform: "Facebook",  reach: 380000, engagement: 2.9, posts: 89,  color: "#1877F2" },
  { platform: "Threads",   reach: 240000, engagement: 4.2, posts: 64,  color: "#101010" },
];

const pieData = platformPerf.map(p => ({ name: p.platform, value: p.reach, color: p.color }));

const topPosts = [
  { id: 1, title: "How AI Agents Are Replacing 50 Social Media Managers",  platform: "LinkedIn",  reach: 84200, engagement: 12.4, likes: 2840 },
  { id: 2, title: "The Secret Framework Behind 10M Impression Campaigns",   platform: "Instagram", reach: 126000,engagement: 9.8,  likes: 7420 },
  { id: 3, title: "We analyzed 1000 viral posts. Here's what we found 🧵",  platform: "Twitter",   reach: 48200, engagement: 8.2,  likes: 1820 },
  { id: 4, title: "Why B2B Marketing in 2025 Is Nothing Like 2020",        platform: "LinkedIn",  reach: 68400, engagement: 11.1, likes: 2140 },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

import { useAppStore } from "@/store/app-store";

export default function AnalyticsPage() {
  const { posts } = useAppStore();
  const [period, setPeriod] = useState("30d");

  const publishedCount = posts.filter(p => p.status === "published" || p.status === "scheduled").length;
  const dynamicReach = 3220000 + (publishedCount * 12500);

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div className="page-header" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0A0A0B", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.025em" }}>
              Analytics
            </h1>
            <p style={{ color: "#71717A", fontSize: 14, margin: "6px 0 0" }}>
              AI-powered insights across all your accounts and platforms
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div className="tabs-list">
              {["7d","30d","90d","1y"].map(p => (
                <button key={p} className={`tab-item ${period === p ? "active" : ""}`} onClick={() => setPeriod(p)}>
                  {p}
                </button>
              ))}
            </div>
            <motion.button className="btn btn-secondary btn-sm" whileHover={{ y: -1 }}>
              <Download size={13} /> Export
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Top Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Reach",     value: dynamicReach, change: +18.6, icon: Eye,           color: "#2563EB", bg: "#EFF6FF" },
          { label: "Impressions",     value: 8400000, change: +24.2, icon: TrendingUp,     color: "#7C3AED", bg: "#F5F3FF" },
          { label: "Engagement Rate", value: "6.4%",  change: +1.2,  icon: Heart,          color: "#059669", bg: "#ECFDF5" },
          { label: "Followers",       value: 124200,  change: +12.8, icon: Users,          color: "#D97706", bg: "#FFFBEB" },
          { label: "Link Clicks",     value: 48200,   change: +31.4, icon: MousePointer2,  color: "#0284C7", bg: "#F0F9FF" },
        ].map((s, i) => {
          const SIcon = s.icon;
          return (
            <motion.div
              key={s.label}
              className="card"
              style={{ padding: "18px 20px" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -2 }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <SIcon size={16} color={s.color} />
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 99,
                  background: s.change > 0 ? "#ECFDF5" : "#FEF2F2",
                  color: s.change > 0 ? "#059669" : "#DC2626",
                  display: "flex", alignItems: "center", gap: 2,
                }}>
                  {s.change > 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                  {s.change > 0 ? "+" : ""}{s.change}%
                </span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#0A0A0B", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.03em" }}>
                {typeof s.value === "number" ? formatNumber(s.value) : s.value}
              </div>
              <div style={{ fontSize: 12, color: "#71717A", marginTop: 2 }}>{s.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Engagement Over Time */}
        <motion.div
          className="card"
          style={{ padding: 24 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Engagement Over Time</h3>
              <p style={{ fontSize: 12, color: "#71717A", margin: "3px 0 0" }}>Cross-platform engagement trends</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={engagementData} margin={{ left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="al" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ai" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E1306C" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#E1306C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#A1A1AA" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#A1A1AA" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E4E4E7", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }} />
              <Legend />
              <Area type="monotone" dataKey="linkedin"  stroke="#0077B5" fill="url(#al)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="instagram" stroke="#E1306C" fill="url(#ai)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="twitter"   stroke="#71717A" fill="none" strokeWidth={2} dot={false} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Platform Breakdown */}
        <motion.div
          className="card"
          style={{ padding: 24 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>Platform Reach</h3>
          <p style={{ fontSize: 12, color: "#71717A", margin: "0 0 16px" }}>Audience reach by platform</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" strokeWidth={0}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(val: any) => formatNumber(Number(val) || 0)} contentStyle={{ borderRadius: 10, border: "1px solid #E4E4E7" }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {platformPerf.map(p => (
              <div key={p.platform} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#52525B", flex: 1 }}>{p.platform}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#0A0A0B" }}>{formatNumber(p.reach)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Posting Heatmap */}
      <motion.div
        className="card"
        style={{ padding: 24, marginBottom: 24 }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Best Posting Time Heatmap</h3>
          <p style={{ fontSize: 12, color: "#71717A", margin: "3px 0 0" }}>Engagement intensity by day and hour — AI recommends highlighted times</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "60px repeat(24, 1fr)", gap: 2 }}>
          <div />
          {Array.from({ length: 24 }).map((_, h) => (
            <div key={h} style={{ fontSize: 9, color: "#A1A1AA", textAlign: "center", paddingBottom: 4 }}>
              {h}h
            </div>
          ))}
          {weekDays.map((day, dayIdx) => (
            <>
              <div key={`label-${day}`} style={{ fontSize: 11, color: "#71717A", display: "flex", alignItems: "center", fontWeight: 500 }}>
                {day}
              </div>
              {Array.from({ length: 24 }).map((_, hour) => {
                const cell = heatmapData.find(c => c.day === dayIdx && c.hour === hour);
                const val = cell?.value ?? 0;
                const opacity = Math.max(0.04, val / 100);
                return (
                  <motion.div
                    key={`${dayIdx}-${hour}`}
                    style={{
                      height: 20, borderRadius: 3,
                      background: `rgba(37, 99, 235, ${opacity})`,
                      border: val > 70 ? "1.5px solid rgba(37,99,235,0.5)" : "none",
                    }}
                    whileHover={{ scale: 1.3, zIndex: 10 }}
                    title={`${day} ${hour}:00 — ${val}% engagement`}
                  />
                );
              })}
            </>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
          <span style={{ fontSize: 11, color: "#A1A1AA" }}>Low</span>
          {[0.05, 0.15, 0.3, 0.5, 0.7, 0.9].map((o, i) => (
            <div key={i} style={{ width: 20, height: 12, borderRadius: 3, background: `rgba(37,99,235,${o})` }} />
          ))}
          <span style={{ fontSize: 11, color: "#A1A1AA" }}>High Engagement</span>
        </div>
      </motion.div>

      {/* Top Posts */}
      <motion.div
        className="card"
        style={{ overflow: "hidden" }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #F0F0F2", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Top Performing Posts</h3>
          <button className="btn btn-ghost btn-sm" style={{ fontSize: 12, color: "#71717A" }}>
            View all <ArrowUpRight size={11} />
          </button>
        </div>
        <div>
          {topPosts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + i * 0.06 }}
              style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "16px 24px", borderBottom: "1px solid #F9F9F9",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 800, color: "#A1A1AA", width: 20, textAlign: "right" }}>#{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0A0A0B", marginBottom: 3 }}>{post.title}</div>
                <span className="badge" style={{ fontSize: 10, background: "#F4F4F5", color: "#71717A" }}>{post.platform}</span>
              </div>
              <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
                {[
                  { label: "Reach",      value: formatNumber(post.reach), icon: Eye },
                  { label: "Engagement", value: `${post.engagement}%`,   icon: Heart },
                  { label: "Likes",      value: formatNumber(post.likes), icon: Heart },
                ].map(m => {
                  const MIcon = m.icon;
                  return (
                    <div key={m.label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0A0A0B" }}>{m.value}</div>
                      <div style={{ fontSize: 10, color: "#A1A1AA" }}>{m.label}</div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
