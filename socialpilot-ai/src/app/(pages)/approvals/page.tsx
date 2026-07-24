"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  RefreshCw,
  MessageSquare,
  AlertTriangle,
  Send,
  UserCheck,
  Hash,
  Sparkles,
} from "lucide-react";
import { QueuedPost, ApprovalStatus } from "@/types/core";

const initialQueue: QueuedPost[] = [
  {
    id: "post-101",
    title: "🚀 Enterprise Agentic Workflows for B2B Growth in 2025",
    content: "Automating 80% of repetitive content creation bottlenecks using multi-agent systems. Here is our step-by-step framework for B2B teams. #AI #Growth #Enterprise",
    platform: "linkedin",
    scheduledAt: "Today, 4:00 PM",
    status: "pending_approval",
    author: { name: "Sarah Jenkins", avatar: "SJ", role: "Content Strategist" },
    retryCount: 0,
    qualityScore: 94,
  },
  {
    id: "post-102",
    title: "⚡ 5 Rules for Scaling Multi-Agent Social Automation",
    content: "1. Automate research, synthesize manually. 2. Focus on high-intent hooks. 3. Test 5+ variations per week. The future belongs to agentic workflows. 🧵 👇",
    platform: "twitter",
    scheduledAt: "Tomorrow, 10:30 AM",
    status: "pending_approval",
    author: { name: "Alex Rivera", avatar: "AR", role: "Growth Lead" },
    retryCount: 0,
    qualityScore: 91,
  },
  {
    id: "post-103",
    title: "❌ Failed Publish — OAuth Token Expired on Meta API",
    content: "Q3 Product Announcement & Features Recap. Swipe through for the full breakdown! 📲 #SaaS #ProductUpdate",
    platform: "instagram",
    scheduledAt: "2 hours ago",
    status: "failed",
    author: { name: "Bot Agent", avatar: "AI", role: "Autonomous Agent" },
    failureReason: "Meta API returned 401 Unauthorized (OAuth Token Expired)",
    failureLogSnippet: "[ERR_OAUTH_EXPIRED] 2026-07-24T12:00:04Z POST /v18.0/me/media HTTP/1.1 -> 401 Unauthorized. Access token expired.",
    retryCount: 2,
    qualityScore: 88,
  },
  {
    id: "post-104",
    title: "✨ Approved Campaign Draft — Product Launch Teaser",
    content: "Something big is coming next week. Stay tuned for our biggest agentic AI release yet!",
    platform: "facebook",
    scheduledAt: "July 26, 2026",
    status: "approved",
    author: { name: "Sarah Jenkins", avatar: "SJ", role: "Content Strategist" },
    retryCount: 0,
    qualityScore: 96,
  },
];

export default function ApprovalsPage() {
  const [posts, setPosts] = useState<QueuedPost[]>(initialQueue);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateStatus = (id: string, newStatus: ApprovalStatus) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
    showToast(`Post status updated to ${newStatus.replace("_", " ")}`);
  };

  const handleRetryPublish = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            status: "approved",
            retryCount: p.retryCount + 1,
            failureReason: undefined,
            failureLogSnippet: undefined,
          };
        }
        return p;
      })
    );
    showToast("Retry initiated successfully! Post queued for publishing.");
  };

  const filteredPosts = posts.filter((p) => {
    if (activeFilter === "all") return true;
    return p.status === activeFilter;
  });

  const getStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case "pending_approval":
        return { label: "Pending Approval", bg: "#FAF2EC", color: "#C88A58" };
      case "approved":
        return { label: "Approved", bg: "#F2F7F4", color: "#4A7A5D" };
      case "rejected":
        return { label: "Rejected", bg: "#FDF4F4", color: "#A85858" };
      case "failed":
        return { label: "Failed", bg: "#FDF4F4", color: "#A85858" };
      default:
        return { label: "Draft", bg: "#F7F3ED", color: "#6E6259" };
    }
  };

  return (
    <div className="page-container" style={{ background: "#FDFBF7", minHeight: "100vh" }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed",
              top: 80,
              right: 32,
              zIndex: 100,
              background: "#3C2A21",
              color: "#FFFFFF",
              padding: "12px 20px",
              borderRadius: 10,
              boxShadow: "0 12px 24px rgba(60, 42, 33, 0.2)",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1C1613", margin: 0, letterSpacing: "-0.02em" }}>
              Publishing Queue & Approvals
            </h1>
            <p style={{ color: "#6E6259", fontSize: 14, margin: "4px 0 0" }}>
              Manage multi-channel approval gates, review drafts, and recover failed publishing tasks.
            </p>
          </div>
          <button
            className="btn"
            onClick={() => {
              setPosts((prev) => prev.map((p) => ({ ...p, status: "approved" })));
              showToast("All pending posts approved!");
            }}
            style={{ background: "#3C2A21", color: "#FFFFFF", padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}
          >
            <UserCheck size={15} /> Approve All Pending
          </button>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 6, marginTop: 20 }}>
          {[
            { id: "all", label: "All Items" },
            { id: "pending_approval", label: "Pending Review" },
            { id: "approved", label: "Approved" },
            { id: "failed", label: "Failed & Errors" },
            { id: "rejected", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              style={{
                padding: "7px 14px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                background: activeFilter === tab.id ? "#3C2A21" : "#F7F3ED",
                color: activeFilter === tab.id ? "#FFFFFF" : "#6E6259",
                transition: "all 150ms ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Queue List */}
      {filteredPosts.length === 0 ? (
        <div style={{ background: "#FFFFFF", border: "1px solid #EAE4DC", borderRadius: 16, padding: 48, textAlign: "center" }}>
          <CheckCircle2 size={44} color="#4A7A5D" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: "#1C1613" }}>No items in this view</h3>
          <p style={{ color: "#6E6259", fontSize: 14, margin: 0 }}>All posts in this category have been processed.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filteredPosts.map((post) => {
            const badge = getStatusBadge(post.status);
            return (
              <div
                key={post.id}
                style={{
                  background: "#FFFFFF",
                  border: post.status === "failed" ? "1.5px solid #A85858" : "1px solid #EAE4DC",
                  borderRadius: 14,
                  padding: 20,
                  boxShadow: "0 2px 6px rgba(60, 42, 33, 0.03)",
                }}
              >
                <div style={{ display: "flex", gap: 16 }}>
                  {/* Author Avatar */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "#F7F3ED",
                      color: "#3C2A21",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    {post.author.avatar}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Header line */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1C1613", margin: 0 }}>{post.title}</h3>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: badge.bg,
                            color: badge.color,
                            textTransform: "uppercase",
                          }}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, color: "#6E6259", display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={12} /> {post.scheduledAt}
                      </span>
                    </div>

                    {/* Content */}
                    <p style={{ fontSize: 13, color: "#6E6259", margin: "0 0 12px", lineHeight: 1.6 }}>
                      {post.content}
                    </p>

                    {/* FAILED ERROR CALLOUT RECOVERY SECTION */}
                    {post.status === "failed" && (
                      <div
                        style={{
                          background: "#FDF4F4",
                          border: "1px solid #A85858",
                          borderRadius: 10,
                          padding: 14,
                          marginBottom: 14,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#A85858", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                          <AlertTriangle size={15} /> {post.failureReason}
                        </div>
                        <pre
                          style={{
                            background: "#FFFFFF",
                            border: "1px solid #EAE4DC",
                            borderRadius: 6,
                            padding: 8,
                            fontSize: 11,
                            color: "#1C1613",
                            fontFamily: "monospace",
                            overflowX: "auto",
                            margin: "6px 0 10px",
                          }}
                        >
                          {post.failureLogSnippet}
                        </pre>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 12, color: "#6E6259" }}>Retry Attempts: <strong>{post.retryCount}</strong></span>
                          <button
                            onClick={() => handleRetryPublish(post.id)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "6px 14px",
                              borderRadius: 6,
                              background: "#A85858",
                              color: "#FFFFFF",
                              border: "none",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            <RefreshCw size={13} /> Retry Publish
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action Controls for Approvers */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 12, color: "#A3968C" }}>
                        Author: <strong>{post.author.name}</strong> ({post.author.role}) • Quality Score: <strong style={{ color: "#4A7A5D" }}>{post.qualityScore}/100</strong>
                      </div>

                      {post.status === "pending_approval" && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => handleUpdateStatus(post.id, "rejected")}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "6px 12px",
                              borderRadius: 8,
                              background: "#FDF4F4",
                              border: "1px solid #A85858",
                              color: "#A85858",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            <X size={13} /> Reject
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(post.id, "approved")}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "6px 14px",
                              borderRadius: 8,
                              background: "#4A7A5D",
                              color: "#FFFFFF",
                              border: "none",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            <CheckCircle2 size={13} /> Approve Post
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
