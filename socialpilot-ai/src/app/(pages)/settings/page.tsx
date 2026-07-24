"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Settings, Bot, Palette, Bell, Shield, Key, Database,
  Globe, Cpu, Zap, ChevronRight, Save, RefreshCw, Eye, EyeOff,
  AlertCircle, Check, ToggleLeft, CheckCircle2,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";

const settingsSections = [
  { id: "general",      label: "General",         icon: Settings  },
  { id: "api_keys",     label: "API Keys",         icon: Key       },
  { id: "notifications",label: "Notifications",    icon: Bell      },
  { id: "ai_models",    label: "AI Models",        icon: Cpu       },
  { id: "security",     label: "Security",         icon: Shield    },
];

export default function SettingsPage() {
  const { settings, updateSettings } = useAppStore();
  const [activeSection, setActiveSection] = useState("general");
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [openaiKey, setOpenaiKey] = useState(settings.openaiKey || "");
  const [anthropicKey, setAnthropicKey] = useState(settings.anthropicKey || "");
  const [geminiKey, setGeminiKey] = useState(settings.geminiKey || "");
  const [autoPublish, setAutoPublish] = useState(settings.autoPublish);

  const handleSaveKeys = () => {
    updateSettings({
      openaiKey,
      anthropicKey,
      geminiKey,
      autoPublish,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="page-container">
      <motion.div className="page-header" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0A0A0B", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.025em" }}>
          Settings & Configuration
        </h1>
        <p style={{ color: "#71717A", fontSize: 14, margin: "6px 0 0" }}>Manage your real API keys, AI model preferences, and platform rules</p>
      </motion.div>

      {savedSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: "14px 20px", background: "#ECFDF5", border: "1px solid #A7F3D0",
            borderRadius: 14, color: "#059669", fontWeight: 600, fontSize: 14,
            display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
          }}
        >
          <CheckCircle2 size={18} />
          <span>Settings and API keys saved successfully to persistent local storage!</span>
        </motion.div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24, alignItems: "start" }}>
        {/* Settings Nav */}
        <motion.div
          className="card"
          style={{ padding: 8, position: "sticky", top: 84 }}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {settingsSections.map(s => {
            const SIcon = s.icon;
            return (
              <motion.button
                key={s.id}
                className={`sidebar-item ${activeSection === s.id ? "active" : ""}`}
                style={{ width: "100%", border: "none", background: "none", textAlign: "left", marginBottom: 2 }}
                onClick={() => setActiveSection(s.id)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <SIcon size={16} />
                <span>{s.label}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Settings Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          {activeSection === "general" && (
            <div className="card" style={{ padding: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 24px", color: "#0A0A0B" }}>General Preferences</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#52525B", marginBottom: 6, display: "block" }}>Brand Name</label>
                  <input className="input" defaultValue={settings.brandName} style={{ maxWidth: 400 }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderTop: "1px solid #F0F0F2" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0A0A0B" }}>Auto-publish approved content</div>
                    <div style={{ fontSize: 12, color: "#71717A" }}>Automatically publish posts when generated</div>
                  </div>
                  <motion.button
                    onClick={() => setAutoPublish(!autoPublish)}
                    style={{
                      width: 44, height: 24, borderRadius: 99,
                      background: autoPublish ? "#2563EB" : "#E4E4E7",
                      border: "none", cursor: "pointer", position: "relative",
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <motion.div
                      animate={{ x: autoPublish ? 22 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
                    />
                  </motion.button>
                </div>
              </div>
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #F0F0F2" }}>
                <motion.button className="btn btn-primary" onClick={handleSaveKeys} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                  <Save size={14} /> Save Changes
                </motion.button>
              </div>
            </div>
          )}

          {activeSection === "api_keys" && (
            <div className="card" style={{ padding: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", color: "#0A0A0B" }}>API Keys & AI Credentials</h2>
              <p style={{ fontSize: 13, color: "#71717A", margin: "0 0 24px" }}>
                Enter your OpenAI, Anthropic, or Gemini API keys to route real AI generation requests directly to your accounts.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#52525B", marginBottom: 6, display: "block" }}>OpenAI API Key (sk-...)</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      className="input"
                      type={showKey ? "text" : "password"}
                      placeholder="sk-proj-..."
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                    />
                    <button className="btn btn-secondary btn-icon" onClick={() => setShowKey(!showKey)}>
                      {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#52525B", marginBottom: 6, display: "block" }}>Anthropic API Key (sk-ant-...)</label>
                  <input
                    className="input"
                    type={showKey ? "text" : "password"}
                    placeholder="sk-ant-..."
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#52525B", marginBottom: 6, display: "block" }}>Google Gemini API Key</label>
                  <input
                    className="input"
                    type={showKey ? "text" : "password"}
                    placeholder="AIzaSy..."
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid #F0F0F2" }}>
                <motion.button className="btn btn-primary" onClick={handleSaveKeys} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                  <Save size={14} /> Save Keys & Preferences
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
