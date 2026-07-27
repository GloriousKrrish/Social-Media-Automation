"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  FileText,
  Send,
  SlidersHorizontal,
  Clock,
  Cpu,
} from "lucide-react";
import { useAIGenerate } from "../hooks/useAIGenerate";
import { useAISettings } from "../hooks/useAISettings";
import { TextGenerationResponse } from "../types/ai-types";

const GENERATION_TYPES = [
  { id: "linkedin_post", name: "LinkedIn Post", category: "Social" },
  { id: "twitter_post", name: "X (Twitter) Post", category: "Social" },
  { id: "instagram_caption", name: "Instagram Caption", category: "Social" },
  { id: "facebook_post", name: "Facebook Post", category: "Social" },
  { id: "blog_outline", name: "Blog Outline", category: "Content" },
  { id: "marketing_copy", name: "Marketing Copy", category: "Copy" },
  { id: "product_description", name: "Product Description", category: "Copy" },
  { id: "call_to_action", name: "Call To Action", category: "Copy" },
  { id: "hashtag_generation", name: "Hashtags", category: "Social" },
  { id: "rewrite_content", name: "Rewrite & Polish", category: "Editing" },
  { id: "expand_content", name: "Expand Draft", category: "Editing" },
  { id: "shorten_content", name: "Condense / Shorten", category: "Editing" },
  { id: "summarize_content", name: "Executive Summary", category: "Editing" },
];

export function AIContentGenerator() {
  const { generate, regenerate, isGenerating, error } = useAIGenerate();
  const { data: aiSettings } = useAISettings();

  const [selectedType, setSelectedType] = useState("linkedin_post");
  const [promptInput, setPromptInput] = useState("");
  const [contextInput, setContextInput] = useState("");
  const [outputResult, setOutputResult] = useState<TextGenerationResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptInput.trim()) return;

    try {
      const res = await generate({
        prompt: promptInput.trim(),
        generation_type: selectedType,
        context_input: contextInput.trim() || undefined,
      });
      setOutputResult(res);
    } catch {
      // Handled in hook
    }
  };

  const handleRegenerate = async () => {
    if (!promptInput.trim()) return;
    try {
      const res = await regenerate({
        prompt: promptInput.trim(),
        generation_type: selectedType,
        context_input: contextInput.trim() || undefined,
        temperature: (aiSettings?.creativity || 0.7) + 0.1,
      });
      setOutputResult(res);
    } catch {
      // Handled in hook
    }
  };

  const handleCopy = () => {
    if (!outputResult?.text) return;
    navigator.clipboard.writeText(outputResult.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const wordCount = outputResult?.text ? outputResult.text.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = outputResult?.text ? outputResult.text.length : 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 24, alignItems: "start" }}>
      {/* Input Form Panel */}
      <motion.div
        className="card"
        style={{ padding: 28 }}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#2563EB", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#0A0A0B" }}>AI Content Generator</h2>
            <p style={{ fontSize: 12, color: "#71717A", margin: 0 }}>Auto-applies tone: <b>{aiSettings?.writing_tone || "Professional"}</b></p>
          </div>
        </div>

        <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Generation Type Selector */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#3F3F46", marginBottom: 8, display: "block" }}>
              Generation Format / Objective
            </label>
            <select
              className="input"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ fontWeight: 600 }}
            >
              {GENERATION_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.category}] {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Primary Prompt / Topic Input */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#3F3F46", marginBottom: 6, display: "block" }}>
              Topic, Main Idea, or Key Prompt <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <textarea
              className="input"
              rows={4}
              required
              placeholder="e.g. Announcing our new AI platform capabilities for enterprise marketing teams..."
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              style={{ resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          {/* Optional Background Context */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#3F3F46", marginBottom: 6, display: "block" }}>
              Background Context / Reference Material <span style={{ fontSize: 11, color: "#71717A", fontWeight: 400 }}>(Optional)</span>
            </label>
            <textarea
              className="input"
              rows={3}
              placeholder="Paste raw notes, source URLs, product details, or target keywords here..."
              value={contextInput}
              onChange={(e) => setContextInput(e.target.value)}
              style={{ resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isGenerating || !promptInput.trim()}
            style={{ width: "100%", justifyContent: "center", padding: "12px 20px" }}
          >
            {isGenerating ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <RefreshCw size={16} />
                </motion.div>
                <span>Generating Enterprise Copy...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate Content</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: 16, padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 10, color: "#DC2626", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={16} />
            <span>Generation failed: {error.message}. Please check provider credentials.</span>
          </div>
        )}
      </motion.div>

      {/* Generated Output Panel */}
      <motion.div
        className="card"
        style={{ padding: 28, minHeight: 480, display: "flex", flexDirection: "column", justifyContent: "space-between" }}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #F0F0F2" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={18} color="#2563EB" />
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0A0A0B" }}>Generated Output</h3>
            </div>
            {outputResult && (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-secondary" onClick={handleRegenerate} disabled={isGenerating}>
                  <RefreshCw size={12} /> Regenerate
                </button>
                <button className="btn btn-primary" onClick={handleCopy}>
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}
          </div>

          {/* Result Content */}
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ padding: "40px 20px", textAlign: "center", color: "#71717A" }}
              >
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{ width: 48, height: 48, borderRadius: "50%", background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}
                >
                  <Sparkles size={24} />
                </motion.div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#18181B", marginBottom: 4 }}>
                  Consulting Provider Engine & Prompt Templates...
                </div>
                <div style={{ fontSize: 12 }}>Injecting brand tone, target audience persona, and language parameters</div>
              </motion.div>
            ) : outputResult ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: "#FAFAFA",
                  padding: 20,
                  borderRadius: 12,
                  border: "1px solid #EAE4DC",
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "#18181B",
                  whiteSpace: "pre-wrap",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {outputResult.text}
              </motion.div>
            ) : (
              <div style={{ padding: "60px 20px", textAlign: "center", color: "#A1A1AA" }}>
                <Sparkles size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: "#71717A" }}>No Content Generated Yet</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Select a format, enter your topic, and click Generate Content.</div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Metadata Footer */}
        {outputResult && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #F0F0F2", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "#71717A" }}>
            <div style={{ display: "flex", gap: 16 }}>
              <span><b>{wordCount}</b> Words</span>
              <span><b>{charCount}</b> Characters</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, textTransform: "capitalize" }}>
                <Cpu size={12} /> {outputResult.provider} ({outputResult.model})
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Clock size={12} /> {outputResult.latency_ms} ms
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
