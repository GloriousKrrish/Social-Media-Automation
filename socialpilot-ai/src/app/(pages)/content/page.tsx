"use client";

import { motion } from "framer-motion";
import { AIContentGenerator } from "@/features/ai/components/AIContentGenerator";

export default function ContentPage() {
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
          AI Content Generation Engine
        </h1>
        <p style={{ color: "#71717A", fontSize: 14, margin: "6px 0 0" }}>
          Generate enterprise-grade social copy and content using prompt templates and provider abstractions.
        </p>
      </motion.div>

      {/* Enterprise AI Content Generator Component */}
      <AIContentGenerator />
    </div>
  );
}
