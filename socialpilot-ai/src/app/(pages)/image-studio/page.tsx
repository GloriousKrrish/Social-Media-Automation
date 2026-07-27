"use client";

import { motion } from "framer-motion";
import { AIImageStudio } from "@/features/ai/components/AIImageStudio";

export default function ImageStudioPage() {
  return (
    <div className="page-container">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 24 }}
      >
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: "#0A0A0B",
            margin: 0,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: "-0.025em",
          }}
        >
          AI Creative Studio & Image Management
        </h1>
        <p style={{ color: "#71717A", fontSize: 14, margin: "6px 0 0" }}>
          Generate high-resolution visual assets with preset styles, brand kit parameters, and persistent gallery management.
        </p>
      </motion.div>

      {/* Enterprise AI Creative Studio */}
      <AIImageStudio />
    </div>
  );
}
