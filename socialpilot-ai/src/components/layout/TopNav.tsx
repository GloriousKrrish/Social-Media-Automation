"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Command,
  Plus,
  Shield,
  UserCheck,
  ChevronRight,
  UserPlus,
  CreditCard,
  Send,
  FilePlus,
  Zap,
  CheckCircle2,
  AlertCircle,
  Info,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { UserRole } from "@/types/core";
import { useAuth } from "@/providers/AuthProvider";
import { useNotifications, useUserProfile } from "@/hooks/useInfrastructure";

interface TopNavProps {
  sidebarWidth: number;
  activePage: string;
  onOpenCommandPalette: () => void;
}

const pageBreadcrumbs: Record<string, string[]> = {
  dashboard: ["Dashboard", "Overview"],
  automation: ["Automation", "Workflow Builder"],
  agents: ["AI Agents", "Fleet Status"],
  content: ["Content", "AI Studio"],
  "image-studio": ["Content", "Image Studio"],
  scheduler: ["Publishing", "Calendar Queue"],
  approvals: ["Publishing", "Queue & Approvals"],
  analytics: ["Analytics", "Performance"],
  clients: ["Business", "Clients Hub"],
  team: ["Business", "Team Members"],
  integrations: ["System", "Integrations"],
  billing: ["System", "Billing & Subscriptions"],
  settings: ["System", "General Settings"],
  campaigns: ["Marketing", "Active Campaigns"],
  placeholder: ["System", "Placeholder View"],
};

export default function TopNav({ sidebarWidth, activePage, onOpenCommandPalette }: TopNavProps) {
  const { user, logout } = useAuth();
  const { data: liveProfile } = useUserProfile();
  const { data: notificationsData } = useNotifications();
  const [userRole, setUserRole] = useState<UserRole>("Admin");
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const unreadCount = notificationsData ? notificationsData.filter((n) => !n.is_read).length : 2;

  const breadcrumbPath = pageBreadcrumbs[activePage] || ["SocialPilot AI", activePage];

  return (
    <motion.header
      className="topnav"
      style={{
        left: sidebarWidth,
        background: "#FFFFFF",
        borderBottom: "1px solid #EAE4DC",
        height: 64,
        padding: "0 24px",
      }}
      animate={{ left: sidebarWidth }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Breadcrumbs & Environment Tag */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: "#6E6259" }}>
          <span>{breadcrumbPath[0]}</span>
          <ChevronRight size={13} color="#A3968C" />
          <span style={{ fontWeight: 700, color: "#1C1613" }}>{breadcrumbPath[1]}</span>
        </div>

        {/* Environment Tag */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 8px",
            borderRadius: 12,
            background: "#F2F7F4",
            border: "1px solid #4A7A5D",
            fontSize: 11,
            fontWeight: 700,
            color: "#4A7A5D",
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4A7A5D" }} />
          Production
        </div>
      </div>

      {/* Global Command Palette Search Trigger */}
      <div
        onClick={onOpenCommandPalette}
        className="search-bar"
        style={{
          width: 280,
          background: "#F7F3ED",
          border: "1px solid #EAE4DC",
          cursor: "pointer",
          borderRadius: 8,
          padding: "7px 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Search size={15} color="#6E6259" />
        <span style={{ fontSize: 13, color: "#A3968C", flex: 1 }}>Search commands...</span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            background: "#FFFFFF",
            border: "1px solid #EAE4DC",
            borderRadius: 4,
            padding: "1px 5px",
          }}
        >
          <Command size={11} color="#6E6259" />
          <span style={{ fontSize: 11, color: "#6E6259", fontWeight: 700 }}>K</span>
        </div>
      </div>

      {/* Role Selector Trigger */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setRoleMenuOpen(!roleMenuOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 10px",
            borderRadius: 8,
            background: "#F7F3ED",
            border: "1px solid #EAE4DC",
            fontSize: 12,
            fontWeight: 700,
            color: "#3C2A21",
            cursor: "pointer",
          }}
        >
          <Shield size={14} color="#C88A58" />
          Role: {userRole}
        </button>

        <AnimatePresence>
          {roleMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              style={{
                position: "absolute",
                top: "115%",
                right: 0,
                width: 160,
                background: "#FFFFFF",
                border: "1px solid #EAE4DC",
                borderRadius: 8,
                boxShadow: "0 8px 16px rgba(60, 42, 33, 0.1)",
                padding: 4,
                zIndex: 50,
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: "#A3968C", padding: "4px 8px", textTransform: "uppercase" }}>
                Switch Active Role
              </div>
              {(["Admin", "Editor", "Viewer"] as UserRole[]).map((r) => (
                <div
                  key={r}
                  onClick={() => {
                    setUserRole(r);
                    setRoleMenuOpen(false);
                  }}
                  style={{
                    padding: "6px 8px",
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 6,
                    background: userRole === r ? "#F7F3ED" : "transparent",
                    color: "#1C1613",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {r}
                  {userRole === r && <CheckCircle2 size={12} color="#C88A58" />}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Role-Aware Quick Actions Menu */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setQuickActionsOpen(!quickActionsOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 8,
            background: "#3C2A21",
            color: "#FFFFFF",
            border: "none",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(60, 42, 33, 0.2)",
          }}
        >
          <Plus size={15} /> Quick Action
        </button>

        <AnimatePresence>
          {quickActionsOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              style={{
                position: "absolute",
                top: "115%",
                right: 0,
                width: 200,
                background: "#FFFFFF",
                border: "1px solid #EAE4DC",
                borderRadius: 10,
                boxShadow: "0 12px 24px rgba(60, 42, 33, 0.14)",
                padding: 6,
                zIndex: 50,
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: "#A3968C", padding: "6px 8px", textTransform: "uppercase" }}>
                Actions for {userRole}
              </div>

              {userRole === "Admin" ? (
                <>
                  <div className="dropdown-action-item" onClick={() => setQuickActionsOpen(false)}>
                    <UserPlus size={14} color="#3C2A21" /> Invite User
                  </div>
                  <div className="dropdown-action-item" onClick={() => setQuickActionsOpen(false)}>
                    <CreditCard size={14} color="#3C2A21" /> Manage Billing
                  </div>
                  <div className="dropdown-action-item" onClick={() => setQuickActionsOpen(false)}>
                    <Send size={14} color="#3C2A21" /> Publish All Approved
                  </div>
                </>
              ) : (
                <>
                  <div className="dropdown-action-item" onClick={() => setQuickActionsOpen(false)}>
                    <FilePlus size={14} color="#3C2A21" /> New Post Draft
                  </div>
                  <div className="dropdown-action-item" onClick={() => setQuickActionsOpen(false)}>
                    <Zap size={14} color="#3C2A21" /> Draft Automation
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notifications Button & Dropdown */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          style={{
            background: "#F7F3ED",
            border: "1px solid #EAE4DC",
            borderRadius: 8,
            padding: 8,
            cursor: "pointer",
            display: "flex",
            position: "relative",
          }}
        >
          <Bell size={18} color="#6E6259" />
          {unreadCount > 0 && (
            <div
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#C88A58",
              }}
            />
          )}
        </button>

        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              style={{
                position: "absolute",
                top: "115%",
                right: 0,
                width: 320,
                background: "#FFFFFF",
                border: "1px solid #EAE4DC",
                borderRadius: 12,
                boxShadow: "0 12px 28px rgba(60, 42, 33, 0.14)",
                padding: 12,
                zIndex: 50,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid #F0EAE1" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1C1613" }}>Notifications ({unreadCount} unread)</span>
                <span style={{ fontSize: 11, color: "#C88A58", fontWeight: 600, cursor: "pointer" }}>Mark all read</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 240, overflowY: "auto" }}>
                {notificationsData && notificationsData.length > 0 ? (
                  notificationsData.map((item) => (
                    <div key={item.id} style={{ padding: "8px 10px", borderRadius: 8, background: "#F7F3ED", border: "1px solid #EAE4DC" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#1C1613" }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: "#6E6259", marginTop: 2 }}>{item.message}</div>
                    </div>
                  ))
                ) : (
                  <>
                    <div style={{ padding: "8px 10px", borderRadius: 8, background: "#F7F3ED", border: "1px solid #EAE4DC" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#1C1613" }}>AI Campaign Published</div>
                      <div style={{ fontSize: 11, color: "#6E6259", marginTop: 2 }}>23 posts dispatched across LinkedIn & Twitter</div>
                    </div>
                    <div style={{ padding: "8px 10px", borderRadius: 8, background: "#F7F3ED", border: "1px solid #EAE4DC" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#1C1613" }}>Approval Required</div>
                      <div style={{ fontSize: 11, color: "#6E6259", marginTop: 2 }}>2 drafts pending review in Queue</div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Login / Profile Avatar Link */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 10px",
            borderRadius: 8,
            background: "#F7F3ED",
            border: "1px solid #EAE4DC",
            color: "#1C1613",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "#3C2A21",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 11,
            }}
          >
            {user?.initials || "US"}
          </div>
          <span>{user?.full_name ? user.full_name.split(" ")[0] : "Account"}</span>
        </button>

        <AnimatePresence>
          {userMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              style={{
                position: "absolute",
                top: "115%",
                right: 0,
                width: 220,
                background: "#FFFFFF",
                border: "1px solid #EAE4DC",
                borderRadius: 10,
                boxShadow: "0 12px 24px rgba(60, 42, 33, 0.12)",
                padding: 8,
                zIndex: 50,
              }}
            >
              <div style={{ padding: "6px 8px", borderBottom: "1px solid #F0EAE1", marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1C1613" }}>
                  {user?.full_name || "Guest User"}
                </div>
                <div style={{ fontSize: 11, color: "#6E6259", wordBreak: "break-all" }}>
                  {user?.email || "not signed in"}
                </div>
              </div>

              <a
                href="/login"
                onClick={() => setUserMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#1C1613",
                  borderRadius: 6,
                  textDecoration: "none",
                }}
                className="dropdown-action-item"
              >
                <UserIcon size={14} color="#3C2A21" /> Switch Account
              </a>

              <button
                onClick={() => {
                  logout();
                  setUserMenuOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#A85858",
                  background: "none",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  textAlign: "left",
                }}
                className="dropdown-action-item"
              >
                <LogOut size={14} color="#A85858" /> Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      <style jsx>{`
        .dropdown-action-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          font-size: 13px;
          font-weight: 500;
          color: #1c1613;
          border-radius: 6px;
          cursor: pointer;
          transition: background 150ms ease;
        }
        .dropdown-action-item:hover {
          background: #f7f3ed;
        }
      `}</style>
    </motion.header>
  );
}
