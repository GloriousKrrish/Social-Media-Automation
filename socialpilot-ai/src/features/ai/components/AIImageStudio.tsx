"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw, Layers, Grid, Palette, Image as ImageIcon } from "lucide-react";
import { ImagePromptBuilder } from "./ImagePromptBuilder";
import { ImageStyleSelector } from "./ImageStyleSelector";
import { AspectRatioSelector } from "./AspectRatioSelector";
import { ImagePreviewCard } from "./ImagePreviewCard";
import { ImageGallery, AIImageRecordItem } from "./ImageGallery";
import { BrandKitForm, BrandKitData } from "./BrandKitForm";

export function AIImageStudio() {
  const [activeTab, setActiveTab] = useState<"studio" | "gallery" | "brand">("studio");
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("photorealistic");
  const [selectedRatio, setSelectedRatio] = useState("1:1");
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1080);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [renderedPrompt, setRenderedPrompt] = useState("");
  const [galleryImages, setGalleryImages] = useState<AIImageRecordItem[]>([]);

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
          width: selectedRatio === "custom" ? customWidth : undefined,
          height: selectedRatio === "custom" ? customHeight : undefined,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedUrl(data.imageUrl);
        setRenderedPrompt(data.rendered_prompt || prompt);

        const newRecord: AIImageRecordItem = {
          id: data.record_id || String(Date.now()),
          prompt,
          rendered_prompt: data.rendered_prompt || prompt,
          provider: data.provider || "pollinations",
          style: selectedStyle,
          aspect_ratio: selectedRatio,
          width: data.width || 1080,
          height: data.height || 1080,
          image_url: data.imageUrl,
          status: "success",
          created_at: new Date().toISOString(),
        };

        setGalleryImages((prev) => [newRecord, ...prev]);
      }
    } catch (e) {
      console.error("Image generation failed", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteImage = (id: string) => {
    setGalleryImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Studio Tabs */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8, background: "#F4F4F5", padding: 4, borderRadius: 12 }}>
          <button
            className={`btn ${activeTab === "studio" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("studio")}
            style={{ fontSize: 13, gap: 6 }}
          >
            <Sparkles size={14} /> Image Studio Generator
          </button>
          <button
            className={`btn ${activeTab === "gallery" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("gallery")}
            style={{ fontSize: 13, gap: 6 }}
          >
            <Grid size={14} /> Image Gallery ({galleryImages.length})
          </button>
          <button
            className={`btn ${activeTab === "brand" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("brand")}
            style={{ fontSize: 13, gap: 6 }}
          >
            <Palette size={14} /> Brand Kit
          </button>
        </div>
      </div>

      {activeTab === "studio" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, alignItems: "start" }}>
          {/* Controls */}
          <motion.div className="card" style={{ padding: 28 }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <ImagePromptBuilder prompt={prompt} setPrompt={setPrompt} />
              <ImageStyleSelector selectedStyle={selectedStyle} onSelectStyle={setSelectedStyle} />
              <AspectRatioSelector
                selectedRatio={selectedRatio}
                onSelectRatio={setSelectedRatio}
                customWidth={customWidth}
                customHeight={customHeight}
                onChangeCustomWidth={setCustomWidth}
                onChangeCustomHeight={setCustomHeight}
              />

              <motion.button
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: 15, marginTop: 8 }}
                onClick={handleGenerate}
                disabled={isGenerating || !prompt}
                whileHover={{ y: -1, boxShadow: "0 8px 24px rgba(37,99,235,0.3)" }}
                whileTap={{ scale: 0.98 }}
              >
                {isGenerating ? (
                  <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><RefreshCw size={16} /></motion.div> Synthesizing AI Image...</>
                ) : (
                  <><Sparkles size={16} /> Generate AI Image</>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Live Preview */}
          <ImagePreviewCard
            imageUrl={generatedUrl}
            prompt={prompt}
            renderedPrompt={renderedPrompt}
            isGenerating={isGenerating}
            onRegenerate={handleGenerate}
            aspectRatio={selectedRatio}
            width={selectedRatio === "custom" ? customWidth : 1080}
            height={selectedRatio === "custom" ? customHeight : 1080}
          />
        </div>
      )}

      {activeTab === "gallery" && (
        <ImageGallery images={galleryImages} onDelete={handleDeleteImage} onRegenerate={handleGenerate} />
      )}

      {activeTab === "brand" && (
        <div className="card" style={{ padding: 28, maxWidth: 640 }}>
          <BrandKitForm onSave={(data) => console.log("Saved Brand Kit", data)} />
        </div>
      )}
    </div>
  );
}
