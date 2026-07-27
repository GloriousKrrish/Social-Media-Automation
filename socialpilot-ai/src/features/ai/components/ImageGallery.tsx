"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Trash2, Download, Copy, RefreshCw, Clock, ExternalLink } from "lucide-react";

export interface AIImageRecordItem {
  id: string;
  prompt: string;
  rendered_prompt: string;
  provider: string;
  style: string;
  aspect_ratio: string;
  width: number;
  height: number;
  image_url: string;
  status: string;
  created_at: string;
}

interface ImageGalleryProps {
  images: AIImageRecordItem[];
  onDelete?: (id: string) => void;
  onRegenerate?: (id: string) => void;
}

export function ImageGallery({ images, onDelete, onRegenerate }: ImageGalleryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStyleFilter, setSelectedStyleFilter] = useState("all");

  const filteredImages = images.filter((img) => {
    const matchesSearch = img.prompt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStyle = selectedStyleFilter === "all" || img.style === selectedStyleFilter;
    return matchesSearch && matchesStyle;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Search and Filters */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
          <Search size={16} color="#71717A" style={{ position: "absolute", left: 12, top: 11 }} />
          <input
            className="input"
            placeholder="Search generated image prompts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Filter size={14} color="#71717A" />
          <select
            className="input select"
            value={selectedStyleFilter}
            onChange={(e) => setSelectedStyleFilter(e.target.value)}
            style={{ width: 160 }}
          >
            <option value="all">All Styles</option>
            <option value="photorealistic">Photorealistic</option>
            <option value="modern">Modern Tech</option>
            <option value="corporate">Corporate</option>
            <option value="luxury">Luxury</option>
            <option value="minimal">Minimal</option>
            <option value="flat_illustration">Flat Vector</option>
            <option value="watercolor">Watercolor</option>
            <option value="anime">Anime Studio</option>
            <option value="3d_render">3D Render</option>
            <option value="cyberpunk">Cyberpunk</option>
            <option value="vintage">Vintage</option>
            <option value="cartoon">3D Cartoon</option>
          </select>
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredImages.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "#71717A" }}>
          No image records match your filter criteria.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {filteredImages.map((img) => (
            <motion.div key={img.id} className="card" style={{ overflow: "hidden" }} whileHover={{ y: -2 }}>
              <div style={{ height: 220, position: "relative", background: "#F4F4F5", overflow: "hidden" }}>
                <img src={img.image_url} alt={img.prompt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 6 }}>
                  {onDelete && (
                    <motion.button
                      onClick={() => onDelete(img.id)}
                      whileTap={{ scale: 0.9 }}
                      style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(239, 68, 68, 0.9)", border: "none", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}
                      title="Delete Image Record"
                    >
                      <Trash2 size={13} />
                    </motion.button>
                  )}
                </div>
              </div>

              <div style={{ padding: "14px 16px" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#18181B", margin: "0 0 8px", lineHeight: 1.4, height: 36, overflow: "hidden" }}>
                  {img.prompt}
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "#71717A" }}>
                  <span className="badge badge-blue" style={{ fontSize: 10 }}>{img.style}</span>
                  <span>{img.width}×{img.height} ({img.aspect_ratio})</span>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: "center", fontSize: 11 }} onClick={() => navigator.clipboard.writeText(img.prompt)}>
                    <Copy size={11} /> Prompt
                  </button>
                  <a href={img.image_url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                    <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }}>
                      <ExternalLink size={11} /> View
                    </button>
                  </a>
                  {onRegenerate && (
                    <button className="btn btn-primary btn-sm" style={{ fontSize: 11 }} onClick={() => onRegenerate(img.id)}>
                      <RefreshCw size={11} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
