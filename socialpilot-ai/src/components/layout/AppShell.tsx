"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUIStore } from "@/store/ui-store";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import { useAutoSyncEngine } from "@/hooks/useAutoSyncEngine";
import CommandPalette from "@/components/common/CommandPalette";

export default function AppShell({ children }: { children?: React.ReactNode }) {
  useAutoSyncEngine();
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarCollapsed } = useUIStore();

  const urlSegment = pathname ? pathname.replace(/^\//, "") : "";
  const [activePage, setActivePage] = useState(urlSegment || "dashboard");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const sidebarWidth = sidebarCollapsed ? 72 : 260;

  useEffect(() => {
    if (urlSegment && urlSegment !== activePage) {
      setActivePage(urlSegment);
    }
  }, [urlSegment]);

  const handleNavigate = (page: string) => {
    setActivePage(page);
    router.push(`/${page}`);
  };

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
      <Sidebar activePage={activePage} onNavigate={handleNavigate} />
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
            key={pathname || activePage}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {children}
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
