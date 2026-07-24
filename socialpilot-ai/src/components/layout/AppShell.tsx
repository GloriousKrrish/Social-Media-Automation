"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUIStore } from "@/store/ui-store";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import { useAutoSyncEngine } from "@/hooks/useAutoSyncEngine";
import CommandPalette from "@/components/common/CommandPalette";
import DashboardPage from "@/app/(pages)/dashboard/page";
import AgentsPage from "@/app/(pages)/agents/page";
import AutomationPage from "@/app/(pages)/automation/page";
import ContentPage from "@/app/(pages)/content/page";
import ImageStudioPage from "@/app/(pages)/image-studio/page";
import SchedulerPage from "@/app/(pages)/scheduler/page";
import AnalyticsPage from "@/app/(pages)/analytics/page";
import IntegrationsPage from "@/app/(pages)/integrations/page";
import SettingsPage from "@/app/(pages)/settings/page";
import ClientsPage from "@/app/(pages)/clients/page";
import TeamPage from "@/app/(pages)/team/page";
import CampaignsPage from "@/app/(pages)/campaigns/page";
import BillingPage from "@/app/(pages)/billing/page";
import ApprovalsPage from "@/app/(pages)/approvals/page";
import PlaceholderPage from "@/app/(pages)/placeholder/page";

function PageRenderer({ page }: { page: string }) {
  switch (page) {
    case "dashboard":    return <DashboardPage />;
    case "agents":       return <AgentsPage />;
    case "automation":   return <AutomationPage />;
    case "content":      return <ContentPage />;
    case "image-studio": return <ImageStudioPage />;
    case "scheduler":    return <SchedulerPage />;
    case "analytics":    return <AnalyticsPage />;
    case "integrations": return <IntegrationsPage />;
    case "settings":     return <SettingsPage />;
    case "clients":      return <ClientsPage />;
    case "team":         return <TeamPage />;
    case "campaigns":    return <CampaignsPage />;
    case "billing":      return <BillingPage />;
    case "approvals":    return <ApprovalsPage />;
    default:             return <PlaceholderPage page={page} />;
  }
}

export default function AppShell() {
  useAutoSyncEngine();
  const { sidebarCollapsed } = useUIStore();
  const [activePage, setActivePage] = useState("dashboard");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const sidebarWidth = sidebarCollapsed ? 72 : 260;

  // Keybindings listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <TopNav
        sidebarWidth={sidebarWidth}
        activePage={activePage}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      <motion.main
        className="main-content"
        animate={{ marginLeft: sidebarWidth }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ marginLeft: sidebarWidth }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <PageRenderer page={activePage} />
          </motion.div>
        </AnimatePresence>
      </motion.main>

      {/* Global Command Palette Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
