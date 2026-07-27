"use client";

import { motion } from "framer-motion";
import { Wand2 } from "lucide-react";

interface ImagePromptBuilderProps {
  prompt: string;
  setPrompt: (p: string) => void;
  onEnhance?: () => void;
}

export function ImagePromptBuilder({ prompt, setPrompt, onEnhance }: ImagePromptBuilderProps) {
  const handleDefaultEnhance = () => {
    if (onEnhance) {
      onEnhance();
    } else {
      setPrompt(prompt ? `${prompt}, photorealistic, ultra-detailed, 8k resolution, cinematic lighting, professional composition` : "A futuristic AI creative dashboard on a sleek glass desk in a minimalist studio");
    }
  };

  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#52525B", marginBottom: 8, display: "block" }}>
        IMAGE DESCRIPTION / PROMPT
      </label>
      <div style={{ position: "relative" }}>
        <textarea
          className="input"
          placeholder="Describe the image you want to generate (e.g. 'A futuristic AI marketing dashboard on a glass desk in a minimalist room')..."
          style={{ resize: "none", minHeight: 100, paddingRight: 44, lineHeight: 1.5 }}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "#EFF6FF",
            border: "1px solid #BFDBFE",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={handleDefaultEnhance}
          title="Enhance Prompt with AI Keywords"
          type="button"
        >
          <Wand2 size={15} color="#2563EB" />
        </motion.button>
      </div>
    </div>
  );
}
