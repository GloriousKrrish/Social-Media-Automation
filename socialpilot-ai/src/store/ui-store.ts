"use client";

import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean;
  activePage: string;
  commandPaletteOpen: boolean;
  notificationsOpen: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
  setActivePage: (page: string) => void;
  setCommandPaletteOpen: (v: boolean) => void;
  setNotificationsOpen: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  activePage: "dashboard",
  commandPaletteOpen: false,
  notificationsOpen: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setActivePage: (page) => set({ activePage: page }),
  setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),
  setNotificationsOpen: (v) => set({ notificationsOpen: v }),
}));
