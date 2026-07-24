"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { integrations } from "@/lib/mock-data";
import { Check, Plus, Zap, RefreshCw, Settings2, ExternalLink, Search } from "lucide-react";

const categories = ["All", "Social Media", "AI Providers", "Cloud Storage", "Communication", "Publishing"];

export default function IntegrationsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = integrations.filter(i => {
    const matchCat = activeCategory === "All" || i.category === activeCategory;
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const connectedCount = integrations.filter(i => i.connected).length;

  return (
    <div className="page-container">
      <motion.div className="page-header" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0A0A0B", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.025em" }}>
              Integrations
            </h1>
            <p style={{ color: "#71717A", fontSize: 14, margin: "6px 0 0" }}>
              {connectedCount} of {integrations.length} integrations connected
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, padding: "16px 20px", background: "linear-gradient(135deg, #EFF6FF, #F5F3FF)", borderRadius: 16, border: "1px solid #DBEAFE", alignItems: "center" }}>
            <Zap size={18} color="#2563EB" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0A0A0B" }}>Connect More Platforms</div>
              <div style={{ fontSize: 11, color: "#71717A" }}>Unlock full automation potential</div>
            </div>
            <motion.button className="btn btn-primary btn-sm" whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
              <Plus size={12} /> Browse All
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div className="search-bar" style={{ width: 260 }}>
          <Search size={14} color="#A1A1AA" />
          <input placeholder="Search integrations..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="tabs-list">
          {categories.map(cat => (
            <button key={cat} className={`tab-item ${activeCategory === cat ? "active" : ""}`} onClick={() => setActiveCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {filtered.map((integration, i) => (
          <motion.div
            key={integration.id}
            className="card"
            style={{ padding: 20, cursor: "pointer" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -3, boxShadow: "0 16px 40px rgba(0,0,0,0.09)" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: integration.connected ? "#ECFDF5" : "#F4F4F5",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, border: `1px solid ${integration.connected ? "#A7F3D0" : "#E4E4E7"}`,
              }}>
                {integration.logo}
              </div>
              {integration.connected ? (
                <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 99 }}>
                  <Check size={11} color="#059669" strokeWidth={2.5} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#059669" }}>Connected</span>
                </div>
              ) : (
                <motion.button
                  className="btn btn-secondary btn-sm"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                >
                  Connect
                </motion.button>
              )}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0A0A0B", marginBottom: 3 }}>{integration.name}</div>
            <div style={{ fontSize: 11, color: "#71717A", marginBottom: 12 }}>{integration.category}</div>
            {integration.connected && (
              <div style={{ display: "flex", gap: 6 }}>
                <motion.button className="btn btn-ghost btn-sm" style={{ padding: "5px 10px" }} whileTap={{ scale: 0.96 }}>
                  <Settings2 size={12} /> Configure
                </motion.button>
                <motion.button className="btn btn-ghost btn-sm" style={{ padding: "5px 10px" }} whileTap={{ scale: 0.96 }}>
                  <RefreshCw size={12} /> Sync
                </motion.button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
