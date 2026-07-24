"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Image, Sparkles, RefreshCw, Download, Copy, Wand2,
  Sliders, Palette, ZoomIn, Crop, Layers, Star, Clock,
  ChevronDown, Plus, Check, RotateCcw,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";

const stylePresets = [
  { id: "photorealistic", label: "Photorealistic", color: "#2563EB" },
  { id: "digital_art",    label: "Digital Art",    color: "#7C3AED" },
  { id: "minimalist",     label: "Minimalist",     color: "#059669" },
  { id: "corporate",      label: "Corporate",      color: "#0284C7" },
  { id: "vibrant",        label: "Vibrant",        color: "#D97706" },
  { id: "cinematic",      label: "Cinematic",      color: "#DC2626" },
  { id: "flat_design",    label: "Flat Design",    color: "#7C3AED" },
  { id: "3d_render",      label: "3D Render",      color: "#059669" },
];

const aspectRatios = [
  { id: "1:1",   label: "1:1",  sub: "Instagram",  w: 100, h: 100 },
  { id: "4:5",   label: "4:5",  sub: "Portrait",   w: 80,  h: 100 },
  { id: "16:9",  label: "16:9", sub: "Landscape",  w: 100, h: 56  },
  { id: "9:16",  label: "9:16", sub: "Stories",    w: 56,  h: 100 },
  { id: "2:1",   label: "2:1",  sub: "Twitter",    w: 100, h: 50  },
];

const brandColors = ["#2563EB", "#7C3AED", "#059669", "#D97706", "#0284C7", "#DC2626", "#0A0A0B", "#FFFFFF"];

export default function ImageStudioPage() {
  const { images, addImage } = useAppStore();
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("photorealistic");
  const [selectedRatio, setSelectedRatio] = useState("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"generate" | "history">("generate");

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setGeneratedUrl(null);

    try {
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
          aspectRatio: selectedRatio,
        }),
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        setGeneratedUrl(data.imageUrl);
        addImage({
          prompt,
          style: selectedStyle,
          aspectRatio: selectedRatio,
          url: data.imageUrl,
        });
      }
    } catch (e) {
      console.error("Failed to generate AI image", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const ratio = aspectRatios.find(r => r.id === selectedRatio) ?? aspectRatios[0];

  return (
    <div className="page-container">
      <motion.div className="page-header" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0A0A0B", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.025em" }}>
              Image Studio
            </h1>
            <p style={{ color: "#71717A", fontSize: 14, margin: "6px 0 0" }}>
              Generate real high-resolution AI images powered by Flux & Pollinations API
            </p>
          </div>
          <div className="tabs-list">
            <button className={`tab-item ${activeTab === "generate" ? "active" : ""}`} onClick={() => setActiveTab("generate")}>
              Generate
            </button>
            <button className={`tab-item ${activeTab === "history" ? "active" : ""}`} onClick={() => setActiveTab("history")}>
              History ({images.length})
            </button>
          </div>
        </div>
      </motion.div>

      {activeTab === "generate" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 24, alignItems: "start" }}>
          {/* Controls */}
          <motion.div
            className="card"
            style={{ padding: 28 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Prompt */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#52525B", marginBottom: 8, display: "block" }}>IMAGE PROMPT</label>
              <div style={{ position: "relative" }}>
                <textarea
                  className="input"
                  placeholder="Describe the image you want to generate (e.g. 'A futuristic AI marketing dashboard on a glass desk in a minimalist room')..."
                  style={{ resize: "none", minHeight: 100, paddingRight: 44, lineHeight: 1.5 }}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                />
                <button
                  style={{
                    position: "absolute", bottom: 10, right: 10,
                    width: 30, height: 30, borderRadius: 8,
                    background: "#EFF6FF", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                  onClick={() => setPrompt(p => p + " photorealistic, 8k, cinematic lighting")}
                  title="Enhance prompt with AI keywords"
                >
                  <Wand2 size={14} color="#2563EB" />
                </button>
              </div>
            </div>

            {/* Style Presets */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#52525B", marginBottom: 10, display: "block" }}>STYLE PRESET</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {stylePresets.map(s => (
                  <motion.button
                    key={s.id}
                    onClick={() => setSelectedStyle(s.id)}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      padding: "8px 6px", border: `2px solid ${selectedStyle === s.id ? s.color : "#E4E4E7"}`,
                      borderRadius: 10, background: selectedStyle === s.id ? `${s.color}10` : "white",
                      cursor: "pointer", fontSize: 11, fontWeight: 600,
                      color: selectedStyle === s.id ? s.color : "#71717A",
                      textAlign: "center", transition: "all 0.15s",
                    }}
                  >
                    {s.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#52525B", marginBottom: 10, display: "block" }}>ASPECT RATIO</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {aspectRatios.map(r => (
                  <motion.button
                    key={r.id}
                    onClick={() => setSelectedRatio(r.id)}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      padding: "6px 14px", border: `2px solid ${selectedRatio === r.id ? "#2563EB" : "#E4E4E7"}`,
                      borderRadius: 99, background: selectedRatio === r.id ? "#EFF6FF" : "white",
                      cursor: "pointer", fontSize: 12, fontWeight: 600,
                      color: selectedRatio === r.id ? "#2563EB" : "#71717A",
                      transition: "all 0.15s",
                    }}
                  >
                    <span>{r.label}</span>
                    <span style={{ fontSize: 10, marginLeft: 4, opacity: 0.7 }}>{r.sub}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Generate */}
            <motion.button
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: 15 }}
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              whileHover={{ y: -1, boxShadow: "0 8px 24px rgba(37,99,235,0.3)" }}
              whileTap={{ scale: 0.98 }}
            >
              {isGenerating ? (
                <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><RefreshCw size={15} /></motion.div> Generating Real AI Image...</>
              ) : (
                <><Sparkles size={15} /> Generate Real AI Image</>
              )}
            </motion.button>
          </motion.div>

          {/* Preview */}
          <motion.div
            className="card"
            style={{ padding: 24 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px", color: "#0A0A0B" }}>Preview</h2>

            {/* Image Area */}
            <div style={{
              borderRadius: 16, overflow: "hidden", background: "#F5F5F7",
              border: "2px dashed #E4E4E7",
              display: "flex", alignItems: "center", justifyContent: "center",
              minHeight: 320, position: "relative",
              aspectRatio: ratio.w / ratio.h,
            }}>
              {isGenerating ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid #EFF6FF", borderTopColor: "#2563EB" }}
                  />
                  <p style={{ fontSize: 14, color: "#71717A", margin: 0 }}>Synthesizing real AI image via Flux Model...</p>
                </div>
              ) : generatedUrl ? (
                <>
                  <img
                    src={generatedUrl}
                    alt="AI Generated"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div style={{
                    position: "absolute", bottom: 12, right: 12,
                    display: "flex", gap: 6,
                  }}>
                    <a
                      href={generatedUrl}
                      target="_blank"
                      download="ai-generated.jpg"
                      style={{ textDecoration: "none" }}
                    >
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)",
                          border: "none", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                        }}
                      >
                        <Download size={15} color="#0A0A0B" />
                      </motion.button>
                    </a>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: 32 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 18, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <Image size={28} color="#2563EB" />
                  </div>
                  <p style={{ fontSize: 14, color: "#71717A", margin: 0 }}>
                    Enter a prompt and click <strong>Generate Real AI Image</strong> to view the live result
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      ) : (
        /* History Tab */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}
        >
          {images.map((img) => (
            <motion.div
              key={img.id}
              className="card"
              style={{ overflow: "hidden", cursor: "pointer" }}
              whileHover={{ y: -3 }}
            >
              <div style={{ height: 200, overflow: "hidden", position: "relative" }}>
                <img src={img.url} alt={img.prompt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: "14px 16px" }}>
                <p style={{ fontSize: 12.5, color: "#0A0A0B", margin: "0 0 8px", lineHeight: 1.4, fontWeight: 500 }}>
                  {img.prompt}
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="badge badge-blue" style={{ fontSize: 10 }}>{img.style}</span>
                  <span style={{ fontSize: 11, color: "#A1A1AA" }}>
                    <Clock size={10} style={{ display: "inline", marginRight: 3 }} />
                    {new Date(img.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
