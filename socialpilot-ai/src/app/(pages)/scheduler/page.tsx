"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  ChevronLeft, ChevronRight, Plus, Clock,
  Hash, Calendar, List, LayoutGrid, Filter,
  CheckCircle2, AlertCircle, Edit2, Trash2, MoreHorizontal, GripVertical,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";

// Brand SVG icons
const LinkedinIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
);
const InstagramIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);
const FacebookIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const TwitterIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const platformColors: Record<string, string> = {
  linkedin: "#0077B5", instagram: "#E1306C", twitter: "#000000",
  facebook: "#1877F2", threads: "#101010", blog: "#7C3AED",
};

export default function SchedulerPage() {
  const { posts, deletePost, addPost } = useAppStore();
  const [view, setView] = useState<"month" | "queue">("queue");
  const [currentMonth, setCurrentMonth] = useState(6); // July
  const [currentYear] = useState(2025);
  const [newTitle, setNewTitle] = useState("");
  const [newPlatform, setNewPlatform] = useState<any>("linkedin");
  const [showAddModal, setShowAddModal] = useState(false);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = 23;

  const platformIcon: Record<string, React.ElementType> = {
    linkedin: LinkedinIcon, instagram: InstagramIcon, twitter: TwitterIcon,
    facebook: FacebookIcon, threads: Hash, blog: Hash,
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    addPost({
      title: newTitle,
      content: newTitle + "\n\nGenerated via SocialPilot AI.",
      platform: newPlatform,
      scheduledAt: "Tomorrow, 10:00 AM",
      status: "scheduled",
    });
    setNewTitle("");
    setShowAddModal(false);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div className="page-header" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0A0A0B", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.025em" }}>
              Scheduler
            </h1>
            <p style={{ color: "#71717A", fontSize: 14, margin: "6px 0 0" }}>
              {posts.length} real posts managed in persistent queue
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div className="tabs-list">
              <button className={`tab-item ${view === "queue" ? "active" : ""}`} onClick={() => setView("queue")}>
                <List size={13} /> Queue ({posts.length})
              </button>
              <button className={`tab-item ${view === "month" ? "active" : ""}`} onClick={() => setView("month")}>
                <Calendar size={13} /> Month
              </button>
            </div>
            <motion.button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              <Plus size={14} /> Schedule Post
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <motion.div
            className="modal-content"
            style={{ padding: 24 }}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700 }}>Add Post to Schedule</h3>
            <form onSubmit={handleCreatePost}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#52525B", display: "block", marginBottom: 6 }}>TITLE / TEXT</label>
                <input
                  className="input"
                  placeholder="Post summary or content..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#52525B", display: "block", marginBottom: 6 }}>PLATFORM</label>
                <select className="input select" value={newPlatform} onChange={(e) => setNewPlatform(e.target.value)}>
                  <option value="linkedin">LinkedIn</option>
                  <option value="instagram">Instagram</option>
                  <option value="twitter">Twitter/X</option>
                  <option value="facebook">Facebook</option>
                  <option value="threads">Threads</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule Now</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Queue View */}
      {view === "queue" && (
        <motion.div className="card" style={{ overflow: "hidden" }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #F0F0F2", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#0A0A0B" }}>Publishing Queue</span>
            <span className="badge badge-blue">{posts.length} posts</span>
          </div>

          <div style={{ padding: "8px 0" }}>
            {posts.map((item, i) => {
              const PIcon = platformIcon[item.platform] ?? Hash;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 24px", borderBottom: "1px solid #F9F9F9",
                  }}
                >
                  <GripVertical size={16} color="#D4D4D8" style={{ cursor: "grab", flexShrink: 0 }} />

                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: `${platformColors[item.platform] || "#2563EB"}15`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <PIcon size={16} color={platformColors[item.platform] || "#2563EB"} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0A0A0B", marginBottom: 3 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: "#71717A", display: "flex", alignItems: "center", gap: 6 }}>
                      <Clock size={11} />
                      {item.scheduledAt}
                    </div>
                  </div>

                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 99,
                    background: item.status === "scheduled" ? "#ECFDF5" : item.status === "pending_approval" ? "#FFFBEB" : "#F4F4F5",
                    color: item.status === "scheduled" ? "#059669" : item.status === "pending_approval" ? "#D97706" : "#71717A",
                    textTransform: "capitalize",
                  }}>
                    {item.status.replace("_", " ")}
                  </span>

                  <div style={{ display: "flex", gap: 4 }}>
                    <motion.button
                      className="btn btn-ghost btn-icon"
                      style={{ padding: 6 }}
                      onClick={() => deletePost(item.id)}
                      whileTap={{ scale: 0.9 }}
                      title="Delete post"
                    >
                      <Trash2 size={13} color="#DC2626" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Calendar View */}
      {view === "month" && (
        <motion.div className="card" style={{ padding: 24 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#0A0A0B" }}>
              {months[currentMonth]} {currentYear}
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {days.map(d => <div key={d} style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: "#A1A1AA", padding: "6px 0" }}>{d}</div>)}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} style={{ minHeight: 80, opacity: 0.3 }} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === today;
              return (
                <div key={day} className={`calendar-cell ${isToday ? "today" : ""}`}>
                  <span style={{ fontSize: 13, fontWeight: isToday ? 800 : 500 }}>{day}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
