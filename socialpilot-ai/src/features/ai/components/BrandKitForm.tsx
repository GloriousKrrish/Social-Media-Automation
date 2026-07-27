"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Palette, Check, Save } from "lucide-react";

export interface BrandKitData {
  brand_name: string;
  brand_description: string;
  primary_color: string;
  secondary_color: string;
  typography: string;
  logo_url: string;
  preferred_visual_style: string;
}

interface BrandKitFormProps {
  initialData?: Partial<BrandKitData>;
  onSave: (data: BrandKitData) => void;
}

export function BrandKitForm({ initialData, onSave }: BrandKitFormProps) {
  const [brandName, setBrandName] = useState(initialData?.brand_name || "SocialPilot AI");
  const [brandDesc, setBrandDesc] = useState(initialData?.brand_description || "Enterprise AI Content & Automation Studio");
  const [primaryColor, setPrimaryColor] = useState(initialData?.primary_color || "#2563EB");
  const [secondaryColor, setSecondaryColor] = useState(initialData?.secondary_color || "#7C3AED");
  const [typography, setTypography] = useState(initialData?.typography || "Plus Jakarta Sans");
  const [logoUrl, setLogoUrl] = useState(initialData?.logo_url || "");
  const [visualStyle, setVisualStyle] = useState(initialData?.preferred_visual_style || "photorealistic");
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      brand_name: brandName,
      brand_description: brandDesc,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      typography,
      logo_url: logoUrl,
      preferred_visual_style: visualStyle,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <Palette size={20} color="#2563EB" />
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#18181B" }}>Workspace Visual Brand Kit</h3>
      </div>
      <p style={{ fontSize: 12, color: "#71717A", margin: "0 0 12px" }}>
        Brand settings automatically inject identity and style context into AI Image Studio prompts.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#52525B" }}>BRAND NAME</label>
          <input className="input" value={brandName} onChange={(e) => setBrandName(e.target.value)} required />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#52525B" }}>TYPOGRAPHY</label>
          <input className="input" value={typography} onChange={(e) => setTypography(e.target.value)} />
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#52525B" }}>BRAND DESCRIPTION</label>
        <textarea
          className="input"
          style={{ minHeight: 60 }}
          value={brandDesc}
          onChange={(e) => setBrandDesc(e.target.value)}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#52525B" }}>PRIMARY COLOR</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ width: 40, height: 36, border: "none", borderRadius: 8, cursor: "pointer" }} />
            <input className="input" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#52525B" }}>SECONDARY COLOR</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} style={{ width: 40, height: 36, border: "none", borderRadius: 8, cursor: "pointer" }} />
            <input className="input" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
          </div>
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#52525B" }}>LOGO URL (OPTIONAL)</label>
        <input className="input" placeholder="https://example.com/logo.png" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
      </div>

      <motion.button
        type="submit"
        className="btn btn-primary"
        style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: 14 }}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
      >
        {saved ? <><Check size={16} /> Saved Brand Kit!</> : <><Save size={16} /> Save Brand Kit Preferences</>}
      </motion.button>
    </form>
  );
}
