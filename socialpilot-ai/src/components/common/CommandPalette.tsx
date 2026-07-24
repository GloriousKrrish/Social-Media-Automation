"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Search,
  Bot,
  Zap,
  FileText,
  Navigation,
  Clock,
  ArrowRight,
  X,
  Sparkles,
  Layers,
  Settings,
  Calendar,
  Users,
} from "lucide-react";
import { CommandPaletteItem } from "@/types/core";

const commandItems: CommandPaletteItem[] = [
  // Agents
  { id: "agent-1", title: "Strategy Orchestrator", description: "AI Agent for campaign strategy & channel split", category: "agent", iconName: "Bot", route: "/agents" },
  { id: "agent-2", title: "Content Crafter", description: "Generates platform-tailored post drafts", category: "agent", iconName: "Bot", route: "/agents" },
  { id: "agent-3", title: "Trend Analyst Bot", description: "Monitors viral hashtags & industry news", category: "agent", iconName: "Bot", route: "/agents" },
  
  // Automations
  { id: "auto-1", title: "Auto-Publish Approved Posts", description: "Triggered on approval gate approval", category: "automation", iconName: "Zap", route: "/automation" },
  { id: "auto-2", title: "Slack Approval Notification", description: "Sends pending draft to Slack channel", category: "automation", iconName: "Zap", route: "/automation" },
  { id: "auto-3", title: "Weekly Performance Digest", description: "Summarizes engagement metrics every Monday", category: "automation", iconName: "Zap", route: "/automation" },

  // Templates
  { id: "tpl-1", title: "B2B Product Announcement", description: "High-impact LinkedIn carousel template", category: "template", iconName: "FileText", route: "/content" },
  { id: "tpl-2", title: "Twitter Thread Playbook", description: "5-part educational thread structure", category: "template", iconName: "FileText", route: "/content" },
  { id: "tpl-3", title: "Client Approval Email", description: "Standard template for client review requests", category: "template", iconName: "FileText", route: "/content" },

  // Navigation Shortcuts
  { id: "nav-1", title: "Dashboard", description: "Overview KPI metrics & active queue", category: "navigation", iconName: "Navigation", route: "/dashboard" },
  { id: "nav-2", title: "Publishing Queue & Approvals", description: "Manage pending post approvals & errors", category: "navigation", iconName: "Calendar", route: "/approvals" },
  { id: "nav-3", title: "Automation Builder", description: "Interactive ReactFlow workflow builder", category: "navigation", iconName: "Layers", route: "/automation" },
  { id: "nav-4", title: "Settings & API Keys", description: "Platform keys & security settings", category: "navigation", iconName: "Settings", route: "/settings" },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("socialpilot_recent_searches");
    if (saved) {
      try { setRecentSearches(JSON.parse(saved)); } catch (_) {}
    }
  }, []);

  const saveRecent = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    const updated = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("socialpilot_recent_searches", JSON.stringify(updated));
  };

  const filteredItems = commandItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredItems[selectedIndex]);
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  const handleSelect = (item: CommandPaletteItem) => {
    saveRecent(item.title);
    onClose();
    if (item.route) {
      router.push(item.route);
    }
  };

  const renderIcon = (category: string) => {
    switch (category) {
      case "agent":
        return <Bot size={16} className="text-[#C88A58]" />;
      case "automation":
        return <Zap size={16} className="text-[#D4AF37]" />;
      case "template":
        return <FileText size={16} className="text-[#4A7A5D]" />;
      default:
        return <Navigation size={16} className="text-[#3C2A21]" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: "blur(8px)" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.2 }}
          className="modal-content"
          style={{
            maxWidth: 620,
            background: "#FFFFFF",
            border: "1px solid #EAE4DC",
            boxShadow: "0 24px 48px rgba(60, 42, 33, 0.16)",
            padding: 0,
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid #F0EAE1" }}>
            <Search size={18} color="#6E6259" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search (Agents, Automations, Templates)..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 15,
                color: "#1C1613",
                background: "transparent",
                fontWeight: 500,
              }}
            />
            <button
              onClick={onClose}
              style={{ background: "#F7F3ED", border: "none", borderRadius: 6, padding: 4, cursor: "pointer", display: "flex" }}
            >
              <X size={14} color="#6E6259" />
            </button>
          </div>

          {/* Results Area */}
          <div style={{ maxHeight: 380, overflowY: "auto", padding: "12px 10px" }}>
            {query === "" && recentSearches.length > 0 && (
              <div style={{ marginBottom: 12, padding: "0 8px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#A3968C", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={12} /> Recent Searches
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {recentSearches.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(s)}
                      style={{
                        background: "#F7F3ED",
                        border: "1px solid #EAE4DC",
                        borderRadius: 20,
                        padding: "4px 10px",
                        fontSize: 12,
                        color: "#3C2A21",
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 16px", color: "#6E6259" }}>
                <Sparkles size={24} color="#C88A58" style={{ margin: "0 auto 8px" }} />
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>No matching commands found</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#A3968C" }}>Try searching for "Agents", "Workflow", or "Queue"</p>
              </div>
            ) : (
              filteredItems.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: isSelected ? "#F7F3ED" : "transparent",
                      border: isSelected ? "1px solid #EAE4DC" : "1px solid transparent",
                      cursor: "pointer",
                      transition: "all 150ms ease",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: isSelected ? "#FFFFFF" : "#F7F3ED",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {renderIcon(item.category)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1C1613", display: "flex", alignItems: "center", gap: 8 }}>
                        {item.title}
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: item.category === "agent" ? "#FAF2EC" : item.category === "automation" ? "#FDFBF0" : "#F2F7F4",
                            color: item.category === "agent" ? "#C88A58" : item.category === "automation" ? "#D4AF37" : "#4A7A5D",
                            textTransform: "uppercase",
                          }}
                        >
                          {item.category}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#6E6259", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.description}
                      </div>
                    </div>
                    <ArrowRight size={14} color={isSelected ? "#3C2A21" : "#A3968C"} />
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts */}
          <div
            style={{
              padding: "10px 20px",
              background: "#F7F3ED",
              borderTop: "1px solid #F0EAE1",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 12,
              color: "#6E6259",
            }}
          >
            <span>Navigate: <kbd style={{ background: "#FFFFFF", padding: "2px 6px", borderRadius: 4, border: "1px solid #EAE4DC", fontWeight: 600 }}>↑</kbd> <kbd style={{ background: "#FFFFFF", padding: "2px 6px", borderRadius: 4, border: "1px solid #EAE4DC", fontWeight: 600 }}>↓</kbd></span>
            <span>Select: <kbd style={{ background: "#FFFFFF", padding: "2px 6px", borderRadius: 4, border: "1px solid #EAE4DC", fontWeight: 600 }}>Enter</kbd></span>
            <span>Close: <kbd style={{ background: "#FFFFFF", padding: "2px 6px", borderRadius: 4, border: "1px solid #EAE4DC", fontWeight: 600 }}>Esc</kbd></span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
