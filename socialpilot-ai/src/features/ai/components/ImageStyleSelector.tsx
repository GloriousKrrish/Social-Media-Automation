"use client";

import { motion } from "framer-motion";

export interface StylePreset {
  id: string;
  label: string;
  description: string;
  color: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  { id: "photorealistic", label: "Photorealistic", description: "Ultra-detailed 8k photography & studio lighting", color: "#2563EB" },
  { id: "modern",          label: "Modern Tech",    description: "Sleek tech poster with clean gradients", color: "#0284C7" },
  { id: "corporate",       label: "Corporate",      description: "Professional executive presentation style", color: "#4F46E5" },
  { id: "luxury",          label: "Luxury",         description: "Gold accents & deep elegant backgrounds", color: "#D97706" },
  { id: "minimal",         label: "Minimal",        description: "Simple geometry & clean empty spaces", color: "#059669" },
  { id: "flat_illustration", label: "Flat Vector", description: "Modern 2D vector graphic art", color: "#7C3AED" },
  { id: "watercolor",      label: "Watercolor",     description: "Soft pigment blurs & paper textures", color: "#EC4899" },
  { id: "anime",           label: "Anime Studio",   description: "Vibrant studio anime & cel shading", color: "#F43F5E" },
  { id: "3d_render",       label: "3D Render",      description: "Octane 3D clay & studio lighting", color: "#10B981" },
  { id: "cyberpunk",       label: "Cyberpunk",      description: "Glowing neon, cyan & magenta night aesthetic", color: "#06B6D4" },
  { id: "vintage",         label: "Vintage",        description: "70s grainy retro film texture & warm tones", color: "#EA580C" },
  { id: "cartoon",         label: "3D Cartoon",     description: "Playful cheerful 3D character design", color: "#8B5CF6" },
];

interface ImageStyleSelectorProps {
  selectedStyle: string;
  onSelectStyle: (styleId: string) => void;
}

export function ImageStyleSelector({ selectedStyle, onSelectStyle }: ImageStyleSelectorProps) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#52525B", marginBottom: 10, display: "block" }}>
        PRESET IMAGE STYLE (12 STYLES)
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {STYLE_PRESETS.map((s) => {
          const isSelected = selectedStyle === s.id;
          return (
            <motion.button
              key={s.id}
              onClick={() => onSelectStyle(s.id)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              style={{
                padding: "10px 12px",
                border: `2px solid ${isSelected ? s.color : "#E4E4E7"}`,
                borderRadius: 12,
                background: isSelected ? `${s.color}10` : "white",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: isSelected ? s.color : "#18181B", marginBottom: 2 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 10, color: "#71717A", lineHeight: 1.3 }}>
                {s.description}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
