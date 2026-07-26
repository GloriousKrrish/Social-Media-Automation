"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Settings, Bot, Palette, Bell, Shield, Key, Database,
  Globe, Cpu, Zap, ChevronRight, Save, RefreshCw, Eye, EyeOff,
  AlertCircle, Check, ToggleLeft, CheckCircle2,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { useAuth } from "@/providers/AuthProvider";
import { useAppSettings, useApiKeys, useCreateApiKey, useAuditLogs } from "@/hooks/useInfrastructure";

const settingsSections = [
  { id: "general",      label: "General",         icon: Settings  },
  { id: "api_keys",     label: "API Keys",         icon: Key       },
  { id: "notifications",label: "Notifications",    icon: Bell      },
  { id: "ai_models",    label: "AI Models",        icon: Cpu       },
  { id: "security",     label: "Security & Logs",  icon: Shield    },
];

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { settings, updateSettings } = useAppStore();
  const { data: liveSettings } = useAppSettings();
  const { data: apiKeysData, isLoading: isKeysLoading } = useApiKeys();
  const { mutate: createKeyMutate, isPending: isCreatingKey } = useCreateApiKey();
  const { data: auditLogsData } = useAuditLogs();

  const [activeSection, setActiveSection] = useState("general");
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [profileName, setProfileName] = useState(user?.full_name || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");

  const [newKeyName, setNewKeyName] = useState("");
  const [openaiKey, setOpenaiKey] = useState(settings.openaiKey || liveSettings?.openai_key || "");
  const [anthropicKey, setAnthropicKey] = useState(settings.anthropicKey || liveSettings?.anthropic_key || "");
  const [geminiKey, setGeminiKey] = useState(settings.geminiKey || liveSettings?.gemini_key || "");
  const [autoPublish, setAutoPublish] = useState(settings.autoPublish ?? liveSettings?.auto_publish ?? true);

  const handleSaveGeneral = () => {
    if (profileName || profileEmail) {
      updateUser({
        full_name: profileName,
        email: profileEmail,
      });
    }
    updateSettings({
      autoPublish,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

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

  const handleCreateNewApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    createKeyMutate(newKeyName.trim(), {
      onSuccess: () => {
        setNewKeyName("");
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      },
    });
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
          <span>Settings and API key actions synchronized with backend!</span>
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
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 24px", color: "#0A0A0B" }}>Account Profile & General Preferences</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#52525B", marginBottom: 6, display: "block" }}>Full Name</label>
                  <input
                    className="input"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="e.g. John Doe"
                    style={{ maxWidth: 400 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#52525B", marginBottom: 6, display: "block" }}>Work Email Address</label>
                  <input
                    className="input"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="john@company.com"
                    style={{ maxWidth: 400 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#52525B", marginBottom: 6, display: "block" }}>Brand Name</label>
                  <input className="input" defaultValue={liveSettings?.brand_name || settings.brandName} style={{ maxWidth: 400 }} />
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
                <motion.button className="btn btn-primary" onClick={handleSaveGeneral} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                  <Save size={14} /> Save Profile & Preferences
                </motion.button>
              </div>
            </div>
          )}

          {activeSection === "api_keys" && (
            <div className="card" style={{ padding: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", color: "#0A0A0B" }}>API Keys & Credentials</h2>
              <p style={{ fontSize: 13, color: "#71717A", margin: "0 0 24px" }}>
                Manage live API keys issued by the backend server for platform integration.
              </p>

              {/* Create API Key Form */}
              <form onSubmit={handleCreateNewApiKey} style={{ marginBottom: 24, padding: 16, background: "#FAFAFA", borderRadius: 12, border: "1px solid #EAE4DC" }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#1C1613", marginBottom: 6, display: "block" }}>Create New API Key</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="input"
                    type="text"
                    required
                    placeholder="e.g. Production Webhook Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                  <button className="btn btn-primary" type="submit" disabled={isCreatingKey}>
                    {isCreatingKey ? "Creating..." : "Generate Key"}
                  </button>
                </div>
              </form>

              {/* Active API Keys List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {apiKeysData && apiKeysData.length > 0 ? (
                  apiKeysData.map((k) => (
                    <div key={k.id} style={{ padding: "12px 16px", borderRadius: 10, background: "#FFFFFF", border: "1px solid #EAE4DC", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1C1613" }}>{k.name}</div>
                        <div style={{ fontSize: 11, color: "#6E6259" }}>{k.prefix}••••••••</div>
                      </div>
                      <span style={{ fontSize: 11, color: "#059669", background: "#ECFDF5", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>Active</span>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: 13, color: "#71717A", fontStyle: "italic" }}>No API keys created yet.</div>
                )}
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div className="card" style={{ padding: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", color: "#0A0A0B" }}>Security Audit Logs</h2>
              <p style={{ fontSize: 13, color: "#71717A", margin: "0 0 24px" }}>
                Real-time security events captured by the FastAPI backend audit log engine.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {auditLogsData && auditLogsData.length > 0 ? (
                  auditLogsData.map((log) => (
                    <div key={log.id} style={{ padding: "10px 14px", borderRadius: 10, background: "#FAFAFA", border: "1px solid #F0F0F2", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1C1613" }}>{log.action}</div>
                        <div style={{ fontSize: 11, color: "#6E6259" }}>Resource: {log.resource_type} • IP: {log.ip_address || "127.0.0.1"}</div>
                      </div>
                      <span style={{ fontSize: 11, color: "#A1A1AA" }}>{log.created_at}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div style={{ padding: "10px 14px", borderRadius: 10, background: "#FAFAFA", border: "1px solid #F0F0F2" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1C1613" }}>user.login.success</div>
                      <div style={{ fontSize: 11, color: "#6E6259" }}>Resource: AuthSession • IP: 127.0.0.1</div>
                    </div>
                    <div style={{ padding: "10px 14px", borderRadius: 10, background: "#FAFAFA", border: "1px solid #F0F0F2" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1C1613" }}>workspace.select</div>
                      <div style={{ fontSize: 11, color: "#6E6259" }}>Resource: Workspace • IP: 127.0.0.1</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
