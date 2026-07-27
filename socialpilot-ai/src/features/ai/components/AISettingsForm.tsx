"use client";

import { useState } from "react";
import { Save, CheckCircle2 } from "lucide-react";
import { WorkspaceAISettings } from "../types/ai-types";

interface Props {
  settings?: WorkspaceAISettings;
  onSave: (updates: Partial<WorkspaceAISettings>) => void;
  isSaving: boolean;
}

export function AISettingsForm({ settings, onSave, isSaving }: Props) {
  const [tone, setTone] = useState(settings?.writing_tone || "Professional");
  const [creativity, setCreativity] = useState(settings?.creativity ?? 0.7);
  const [targetAudience, setTargetAudience] = useState(settings?.target_audience || "General Business");
  const [brandVoice, setBrandVoice] = useState(settings?.brand_voice || "Empathetic & Authoritative");
  const [responseLength, setResponseLength] = useState(settings?.response_length || "Medium");
  const [defaultLanguage, setDefaultLanguage] = useState(settings?.default_language || "English");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      writing_tone: tone,
      creativity,
      target_audience: targetAudience,
      brand_voice: brandVoice,
      response_length: responseLength,
      default_language: defaultLanguage,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {savedSuccess && (
        <div style={{ padding: "12px 16px", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 10, color: "#059669", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle2 size={16} /> Workspace AI Parameters Saved!
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#3F3F46", marginBottom: 6, display: "block" }}>Writing Tone</label>
          <select className="input" value={tone} onChange={(e) => setTone(e.target.value)}>
            <option value="Professional">Professional</option>
            <option value="Casual & Friendly">Casual & Friendly</option>
            <option value="Bold & Inspiring">Bold & Inspiring</option>
            <option value="Witty & Humorous">Witty & Humorous</option>
            <option value="Authoritative">Authoritative</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#3F3F46", marginBottom: 6, display: "block" }}>Default Language</label>
          <select className="input" value={defaultLanguage} onChange={(e) => setDefaultLanguage(e.target.value)}>
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Portuguese">Portuguese</option>
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#3F3F46", marginBottom: 6, display: "block" }}>Target Audience</label>
          <input className="input" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="e.g. B2B Executives, Gen Z Consumers" />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#3F3F46", marginBottom: 6, display: "block" }}>Response Length</label>
          <select className="input" value={responseLength} onChange={(e) => setResponseLength(e.target.value)}>
            <option value="Short">Short & Concise</option>
            <option value="Medium">Medium (Balanced)</option>
            <option value="Long">Long & Detailed</option>
          </select>
        </div>
      </div>

      <div>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#3F3F46", marginBottom: 6, display: "block" }}>Brand Voice Description</label>
        <input className="input" value={brandVoice} onChange={(e) => setBrandVoice(e.target.value)} placeholder="Describe core brand persona guidelines" />
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#3F3F46" }}>Creativity / Temperature ({creativity})</label>
          <span style={{ fontSize: 12, color: "#71717A" }}>{creativity < 0.4 ? "Precise" : creativity > 0.8 ? "Highly Creative" : "Balanced"}</span>
        </div>
        <input type="range" min="0.0" max="1.0" step="0.05" value={creativity} onChange={(e) => setCreativity(parseFloat(e.target.value))} style={{ width: "100%" }} />
      </div>

      <div style={{ paddingTop: 12, borderTop: "1px solid #F0F0F2" }}>
        <button type="submit" className="btn btn-primary" disabled={isSaving}>
          <Save size={14} /> {isSaving ? "Saving..." : "Save AI Parameters"}
        </button>
      </div>
    </form>
  );
}
