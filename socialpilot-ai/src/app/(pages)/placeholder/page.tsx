"use client";

import { motion } from "framer-motion";
import { Sparkles, Construction } from "lucide-react";

interface PlaceholderPageProps {
  page: string;
}

const pageLabels: Record<string, { title: string; description: string; emoji: string }> = {
  library:     { title: "Content Library",   description: "Browse and manage all your generated and published content in one place.", emoji: "📚" },
  media:       { title: "Media Library",     description: "Manage your images, videos, and brand assets.", emoji: "🖼️" },
  templates:   { title: "Templates",         description: "Create and manage reusable content templates for your team.", emoji: "📋" },
  prompts:     { title: "Prompt Library",    description: "Store and organize your best AI prompts for quick access.", emoji: "💡" },
  brand:       { title: "Brand Assets",      description: "Manage your logos, colors, fonts, and brand guidelines.", emoji: "🎨" },
  accounts:    { title: "Accounts",          description: "View and manage all connected social media accounts.", emoji: "🌐" },
  marketplace: { title: "Marketplace",       description: "Discover and install workflow templates from the community.", emoji: "🏪" },
  queue:       { title: "Publishing Queue",  description: "Monitor and manage all posts ready for publishing.", emoji: "📤" },
  "video-studio": { title: "Video Studio",  description: "AI-generated short-form video content coming soon.", emoji: "🎬" },
};

export default function PlaceholderPage({ page }: PlaceholderPageProps) {
  const info = pageLabels[page] ?? { title: page, description: "This page is coming soon.", emoji: "✨" };

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", minHeight: "60vh", textAlign: "center",
        }}
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ fontSize: 64, marginBottom: 24 }}
        >
          {info.emoji}
        </motion.div>
        <h1 style={{
          fontSize: 30, fontWeight: 800, color: "#0A0A0B", margin: "0 0 12px",
          fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.025em",
        }}>
          {info.title}
        </h1>
        <p style={{ fontSize: 15, color: "#71717A", maxWidth: 420, margin: "0 0 32px", lineHeight: 1.6 }}>
          {info.description}
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <motion.button
            className="btn btn-primary"
            whileHover={{ y: -1, boxShadow: "0 8px 24px rgba(37,99,235,0.3)" }}
            whileTap={{ scale: 0.97 }}
          >
            <Sparkles size={14} /> Get Early Access
          </motion.button>
          <motion.button className="btn btn-secondary" whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
            Learn More
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
