"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/ui-store";
import {
  LayoutDashboard,
  Zap,
  Bot,
  PenTool,
  Image,
  CalendarDays,
  BarChart2,
  Megaphone,
  CheckSquare,
  Activity,
  Settings,
  Plug,
  CreditCard,
  Building2,
  Users2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Building,
  UserCheck,
  Shield,
} from "lucide-react";
import { Workspace } from "@/types/core";
import { useAuth } from "@/providers/AuthProvider";

const workspacesList: Workspace[] = [
  { id: "ws-1", name: "Acme Corp SaaS", logo: "🚀", plan: "Enterprise", role: "Admin", membersCount: 14 },
  { id: "ws-2", name: "Global Marketing", logo: "🌐", plan: "Pro", role: "Admin", membersCount: 8 },
  { id: "ws-3", name: "Design Studio", logo: "🎨", plan: "Starter", role: "Editor", membersCount: 3 },
];

const navSections = [
  {
    label: "Core",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "automation", label: "Automation Builder", icon: Zap },
      { id: "agents", label: "AI Agents", icon: Bot },
    ],
  },
  {
    label: "Content & Publishing",
    items: [
      { id: "content", label: "Content Studio", icon: PenTool },
      { id: "image-studio", label: "Image Studio", icon: Image },
      { id: "scheduler", label: "Scheduler", icon: CalendarDays },
      { id: "approvals", label: "Queue & Approvals", icon: CheckSquare },
    ],
  },
  {
    label: "Analytics & Team",
    items: [
      { id: "analytics", label: "Analytics", icon: BarChart2 },
      { id: "clients", label: "Clients", icon: Building2 },
      { id: "team", label: "Team Members", icon: Users2 },
    ],
  },
  {
    label: "System",
    items: [
      { id: "integrations", label: "Integrations", icon: Plug },
      { id: "billing", label: "Billing", icon: CreditCard },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { user } = useAuth();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(workspacesList[0]);
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);

  // Cmd + B keyboard shortcut to toggle sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return (
    <motion.aside
      className="sidebar"
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        width: sidebarCollapsed ? 72 : 260,
        background: "#FFFFFF",
        borderRight: "1px solid #EAE4DC",
      }}
    >
      {/* Brand Logo & Workspace Switcher */}
      <div
        className="sidebar-logo"
        style={{
          borderBottom: "1px solid #F0EAE1",
          flexDirection: "column",
          alignItems: "stretch",
          padding: sidebarCollapsed ? "12px 8px" : "12px 14px",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "linear-gradient(135deg, #3C2A21 0%, #C88A58 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 4px 12px rgba(60, 42, 33, 0.2)",
              }}
            >
              <Sparkles size={18} color="#FFFFFF" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span style={{ fontWeight: 800, fontSize: 16, color: "#1C1613", letterSpacing: "-0.02em" }}>
                  SocialPilot<span style={{ color: "#C88A58" }}>AI</span>
                </span>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#A3968C", textTransform: "uppercase" }}>
                  Enterprise SaaS
                </div>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            style={{
              background: "#F7F3ED",
              border: "1px solid #EAE4DC",
              borderRadius: 6,
              padding: 4,
              cursor: "pointer",
              display: "flex",
            }}
            title="Toggle Sidebar (Cmd+B)"
          >
            {sidebarCollapsed ? <ChevronRight size={14} color="#6E6259" /> : <ChevronLeft size={14} color="#6E6259" />}
          </button>
        </div>

        {/* Workspace Switcher Selector */}
        {!sidebarCollapsed && (
          <div style={{ position: "relative" }}>
            <div
              onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 10px",
                borderRadius: 8,
                background: "#F7F3ED",
                border: "1px solid #EAE4DC",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14 }}>{activeWorkspace.logo}</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1C1613", lineHeight: 1.2 }}>
                    {activeWorkspace.name}
                  </div>
                  <div style={{ fontSize: 10, color: "#6E6259" }}>
                    {activeWorkspace.plan} • {activeWorkspace.role}
                  </div>
                </div>
              </div>
              <ChevronDown size={14} color="#6E6259" />
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {wsDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  style={{
                    position: "absolute",
                    top: "105%",
                    left: 14,
                    right: 14,
                    zIndex: 50,
                    background: "#FFFFFF",
                    border: "1px solid #EAE4DC",
                    borderRadius: 10,
                    boxShadow: "0 12px 24px rgba(60, 42, 33, 0.12)",
                    padding: 4,
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#A3968C", padding: "6px 8px", textTransform: "uppercase" }}>
                    Select Organization
                  </div>
                  {workspacesList.map((ws) => (
                    <div
                      key={ws.id}
                      onClick={() => {
                        setActiveWorkspace(ws);
                        setWsDropdownOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 8px",
                        borderRadius: 6,
                        background: activeWorkspace.id === ws.id ? "#F7F3ED" : "transparent",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span>{ws.logo}</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#1C1613" }}>{ws.name}</div>
                          <div style={{ fontSize: 10, color: "#6E6259" }}>{ws.membersCount} members</div>
                        </div>
                      </div>
                      {activeWorkspace.id === ws.id && <Check size={14} color="#C88A58" />}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="sidebar-nav">
        {navSections.map((sec) => (
          <div key={sec.label} style={{ marginBottom: 16 }}>
            {!sidebarCollapsed && <div className="sidebar-section-label">{sec.label}</div>}
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`sidebar-item ${isActive ? "active" : ""}`}
                  style={{
                    justifyContent: sidebarCollapsed ? "center" : "flex-start",
                    background: isActive ? "#F7F3ED" : "transparent",
                    color: isActive ? "#3C2A21" : "#6E6259",
                    borderRadius: 8,
                    margin: "2px 0",
                  }}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon size={18} color={isActive ? "#3C2A21" : "#6E6259"} />
                  {!sidebarCollapsed && (
                    <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 500 }}>
                      {item.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Profile Footer */}
      <div
        className="sidebar-footer"
        style={{
          borderTop: "1px solid #F0EAE1",
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#3C2A21",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {user?.initials || "US"}
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: user ? "#4A7A5D" : "#A3968C",
              border: "2px solid #FFFFFF",
            }}
          />
        </div>

        {!sidebarCollapsed && (
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1C1613", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.full_name || "Guest User"}
            </div>
            <div style={{ fontSize: 11, color: "#6E6259", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.email || "not signed in"}
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
