"use client";

import { motion } from "framer-motion";
import { Megaphone, Plus, BarChart2, Calendar, Play, Pause, MoreHorizontal, TrendingUp, Eye, Heart, Zap } from "lucide-react";

const campaigns = [
  {
    id: 1, name: "Q3 Product Launch 2025", status: "active",
    platforms: ["linkedin","instagram","twitter"],
    posts: 48, scheduled: 12, published: 36,
    reach: 840000, engagement: 7.4,
    startDate: "Jul 1", endDate: "Jul 31",
    progress: 75,
    color: "#2563EB",
  },
  {
    id: 2, name: "Brand Awareness — B2B SaaS", status: "active",
    platforms: ["linkedin","facebook"],
    posts: 30, scheduled: 8, published: 22,
    reach: 420000, engagement: 5.8,
    startDate: "Jul 15", endDate: "Aug 15",
    progress: 48,
    color: "#7C3AED",
  },
  {
    id: 3, name: "Instagram Influencer Collab", status: "paused",
    platforms: ["instagram","threads"],
    posts: 20, scheduled: 20, published: 0,
    reach: 0, engagement: 0,
    startDate: "Aug 1", endDate: "Aug 31",
    progress: 0,
    color: "#E1306C",
  },
  {
    id: 4, name: "SEO Content Push — Industry News", status: "draft",
    platforms: ["linkedin","facebook","twitter"],
    posts: 60, scheduled: 0, published: 0,
    reach: 0, engagement: 0,
    startDate: "Aug 15", endDate: "Sep 15",
    progress: 0,
    color: "#059669",
  },
];

const platformColors: Record<string, string> = {
  linkedin: "#0077B5", instagram: "#E1306C", twitter: "#000000",
  facebook: "#1877F2", threads: "#101010",
};

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  active:  { color: "#059669", bg: "#ECFDF5", label: "Active" },
  paused:  { color: "#D97706", bg: "#FFFBEB", label: "Paused" },
  draft:   { color: "#71717A", bg: "#F4F4F5", label: "Draft"  },
  complete:{ color: "#2563EB", bg: "#EFF6FF", label: "Complete"},
};

import { formatNumber } from "@/lib/utils";

export default function CampaignsPage() {
  return (
    <div className="page-container">
      <motion.div className="page-header" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0A0A0B", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.025em" }}>
              Campaigns
            </h1>
            <p style={{ color: "#71717A", fontSize: 14, margin: "6px 0 0" }}>
              {campaigns.filter(c => c.status === "active").length} active campaigns running
            </p>
          </div>
          <motion.button className="btn btn-primary" whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
            <Plus size={14} /> New Campaign
          </motion.button>
        </div>
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {campaigns.map((campaign, i) => {
          const sc = statusConfig[campaign.status] ?? statusConfig.draft;
          return (
            <motion.div
              key={campaign.id}
              className="card"
              style={{ padding: 24, cursor: "pointer", borderLeft: `4px solid ${campaign.color}` }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -2 }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${campaign.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Megaphone size={20} color={campaign.color} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0A0A0B", margin: 0 }}>{campaign.name}</h3>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: sc.bg, color: sc.color }}>
                      {sc.label}
                    </span>
                    <div style={{ display: "flex", gap: 4, marginLeft: 4 }}>
                      {campaign.platforms.map(p => (
                        <div key={p} style={{ width: 16, height: 16, borderRadius: 4, background: platformColors[p], opacity: 0.8 }} title={p} />
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 24, marginBottom: 14 }}>
                    {[
                      { label: "Posts", value: campaign.posts },
                      { label: "Published", value: campaign.published },
                      { label: "Reach", value: formatNumber(campaign.reach) },
                      { label: "Engagement", value: campaign.engagement ? `${campaign.engagement}%` : "—" },
                    ].map(m => (
                      <div key={m.label}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#0A0A0B", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{m.value}</div>
                        <div style={{ fontSize: 11, color: "#A1A1AA" }}>{m.label}</div>
                      </div>
                    ))}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#52525B" }}>{campaign.startDate} → {campaign.endDate}</div>
                      <div style={{ fontSize: 11, color: "#A1A1AA" }}>Duration</div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: "#71717A" }}>Campaign Progress</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#0A0A0B" }}>{campaign.progress}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: 6 }}>
                      <motion.div
                        className="progress-fill"
                        style={{ background: campaign.color, width: 0 }}
                        animate={{ width: `${campaign.progress}%` }}
                        transition={{ delay: 0.4 + i * 0.1, duration: 0.8 }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {campaign.status === "active" ? (
                    <motion.button className="btn btn-secondary btn-sm" whileTap={{ scale: 0.96 }}>
                      <Pause size={12} /> Pause
                    </motion.button>
                  ) : campaign.status === "paused" ? (
                    <motion.button className="btn btn-primary btn-sm" whileTap={{ scale: 0.96 }}>
                      <Play size={12} /> Resume
                    </motion.button>
                  ) : (
                    <motion.button className="btn btn-primary btn-sm" whileTap={{ scale: 0.96 }}>
                      <Zap size={12} /> Launch
                    </motion.button>
                  )}
                  <motion.button className="btn btn-ghost btn-icon" style={{ padding: 7 }} whileTap={{ scale: 0.9 }}>
                    <MoreHorizontal size={15} color="#71717A" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
