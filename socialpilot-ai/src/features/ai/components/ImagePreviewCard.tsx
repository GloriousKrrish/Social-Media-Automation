"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Copy, RefreshCw, CheckCircle2, Sparkles, ExternalLink } from "lucide-react";

interface ImagePreviewCardProps {
  imageUrl?: string | null;
  prompt?: string;
  renderedPrompt?: string;
  isGenerating?: boolean;
  onRegenerate?: () => void;
  aspectRatio?: string;
  width?: number;
  height?: number;
}

export function ImagePreviewCard({
  imageUrl,
  prompt,
  renderedPrompt,
  isGenerating,
  onRegenerate,
  aspectRatio = "1:1",
  width = 1080,
  height = 1080,
}: ImagePreviewCardProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleCopyUrl = () => {
    if (!imageUrl) return;
    navigator.clipboard.writeText(imageUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyPrompt = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const calculateRatioNum = () => {
    if (aspectRatio === "16:9") return 16 / 9;
    if (aspectRatio === "9:16") return 9 / 16;
    if (aspectRatio === "4:5") return 4 / 5;
    if (aspectRatio === "2:1") return 2 / 1;
    if (width && height) return width / height;
    return 1;
  };

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#18181B" }}>Live Image Preview</h3>
        <span style={{ fontSize: 11, color: "#71717A", fontWeight: 600 }}>{width} × {height} px ({aspectRatio})</span>
      </div>

      <div
        style={{
          borderRadius: 16,
          overflow: "hidden",
          background: "#F4F4F5",
          border: "2px dashed #E4E4E7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 320,
          position: "relative",
          aspectRatio: calculateRatioNum(),
        }}
      >
        {isGenerating ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 24, textAlign: "center" }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid #EFF6FF", borderTopColor: "#2563EB" }}
            />
            <p style={{ fontSize: 13, color: "#71717A", margin: 0, fontWeight: 500 }}>
              Rendering high-resolution AI image via Pollinations Flux Engine...
            </p>
          </div>
        ) : imageUrl ? (
          <>
            <img src={imageUrl} alt={prompt || "AI Generated Image"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", bottom: 12, right: 12, display: "flex", gap: 8 }}>
              <a href={imageUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(8px)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                  title="Open Full Resolution Image"
                >
                  <ExternalLink size={16} color="#18181B" />
                </motion.button>
              </a>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: 32 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Sparkles size={26} color="#2563EB" />
            </div>
            <p style={{ fontSize: 14, color: "#71717A", margin: 0, fontWeight: 500 }}>
              Configure your prompt & style, then click <strong>Generate AI Image</strong>.
            </p>
          </div>
        )}
      </div>

      {imageUrl && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {renderedPrompt && (
            <div style={{ fontSize: 11, color: "#71717A", background: "#F4F4F5", padding: "8px 12px", borderRadius: 8, lineHeight: 1.4 }}>
              <strong>Engine Compiled Prompt:</strong> {renderedPrompt}
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <motion.button className="btn btn-secondary btn-sm" onClick={handleCopyUrl} whileTap={{ scale: 0.95 }} style={{ flex: 1, justifyContent: "center" }}>
              {copiedUrl ? <><CheckCircle2 size={13} color="#059669" /> URL Copied</> : <><Copy size={13} /> Copy Image URL</>}
            </motion.button>
            <motion.button className="btn btn-secondary btn-sm" onClick={handleCopyPrompt} whileTap={{ scale: 0.95 }} style={{ flex: 1, justifyContent: "center" }}>
              {copiedPrompt ? <><CheckCircle2 size={13} color="#059669" /> Prompt Copied</> : <><Copy size={13} /> Copy Prompt</>}
            </motion.button>
            {onRegenerate && (
              <motion.button className="btn btn-primary btn-sm" onClick={onRegenerate} whileTap={{ scale: 0.95 }}>
                <RefreshCw size={13} /> Regenerate
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
