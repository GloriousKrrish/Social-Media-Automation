"use client";

import { motion } from "framer-motion";

export interface AspectRatioOption {
  id: string;
  label: string;
  sub: string;
  width: number;
  height: number;
}

export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  { id: "1:1",   label: "Square",    sub: "1080 × 1080",  width: 1080, height: 1080 },
  { id: "4:5",   label: "Portrait",  sub: "1080 × 1350",  width: 1080, height: 1350 },
  { id: "16:9",  label: "Landscape", sub: "1200 × 628",   width: 1200, height: 628  },
  { id: "9:16",  label: "Story",     sub: "1080 × 1920",  width: 1080, height: 1920 },
  { id: "2:1",   label: "Banner",    sub: "1200 × 600",   width: 1200, height: 600  },
];

interface AspectRatioSelectorProps {
  selectedRatio: string;
  onSelectRatio: (ratioId: string) => void;
  customWidth: number;
  customHeight: number;
  onChangeCustomWidth: (w: number) => void;
  onChangeCustomHeight: (h: number) => void;
}

export function AspectRatioSelector({
  selectedRatio,
  onSelectRatio,
  customWidth,
  customHeight,
  onChangeCustomWidth,
  onChangeCustomHeight,
}: AspectRatioSelectorProps) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#52525B", marginBottom: 10, display: "block" }}>
        ASPECT RATIO & RESOLUTION
      </label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {ASPECT_RATIO_OPTIONS.map((r) => {
          const isSelected = selectedRatio === r.id;
          return (
            <motion.button
              key={r.id}
              onClick={() => onSelectRatio(r.id)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              style={{
                padding: "8px 14px",
                border: `2px solid ${isSelected ? "#2563EB" : "#E4E4E7"}`,
                borderRadius: 99,
                background: isSelected ? "#EFF6FF" : "white",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                color: isSelected ? "#2563EB" : "#71717A",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s ease",
              }}
            >
              <span>{r.label}</span>
              <span style={{ fontSize: 10, opacity: 0.75 }}>({r.sub})</span>
            </motion.button>
          );
        })}
        <motion.button
          onClick={() => onSelectRatio("custom")}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.96 }}
          style={{
            padding: "8px 14px",
            border: `2px solid ${selectedRatio === "custom" ? "#2563EB" : "#E4E4E7"}`,
            borderRadius: 99,
            background: selectedRatio === "custom" ? "#EFF6FF" : "white",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            color: selectedRatio === "custom" ? "#2563EB" : "#71717A",
            transition: "all 0.15s ease",
          }}
        >
          Custom Size
        </motion.button>
      </div>

      {selectedRatio === "custom" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10, padding: 12, background: "#F4F4F5", borderRadius: 12 }}
        >
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#52525B" }}>WIDTH (PX)</label>
            <input
              type="number"
              className="input"
              value={customWidth}
              onChange={(e) => onChangeCustomWidth(Number(e.target.value))}
              min={128}
              max={2048}
              style={{ marginTop: 4 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#52525B" }}>HEIGHT (PX)</label>
            <input
              type="number"
              className="input"
              value={customHeight}
              onChange={(e) => onChangeCustomHeight(Number(e.target.value))}
              min={128}
              max={2048}
              style={{ marginTop: 4 }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
