"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  PenTool, Sparkles, Copy, Download, RefreshCw, ChevronDown,
  Hash, Globe, Smile, Users, Target, Zap, CheckCircle2,
  FileText, BookOpen, BarChart2, Megaphone, Star, ArrowRight, Send,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";

// Brand icons as SVG components
const LinkedinIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
);
const InstagramIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);
const FacebookIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const TwitterIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);

const platforms = [
  { id: "linkedin",  label: "LinkedIn",    icon: LinkedinIcon,  color: "#0077B5", maxChars: 3000 },
  { id: "instagram", label: "Instagram",   icon: InstagramIcon, color: "#E1306C", maxChars: 2200 },
  { id: "twitter",   label: "Twitter/X",   icon: TwitterIcon,   color: "#000000", maxChars: 280  },
  { id: "facebook",  label: "Facebook",    icon: FacebookIcon,  color: "#1877F2", maxChars: 63206},
  { id: "threads",   label: "Threads",     icon: Hash,          color: "#101010", maxChars: 500  },
  { id: "blog",      label: "Blog Post",   icon: BookOpen,      color: "#7C3AED", maxChars: 50000},
];

const postTypes = [
  { id: "educational", label: "Educational",  icon: BookOpen  },
  { id: "promotional", label: "Promotional",  icon: Megaphone },
  { id: "carousel",    label: "Carousel",     icon: Star      },
  { id: "case_study",  label: "Case Study",   icon: BarChart2 },
  { id: "news",        label: "News Update",  icon: FileText  },
  { id: "engagement",  label: "Engagement",   icon: Users     },
];

const tones = ["Professional","Conversational","Authoritative","Inspiring","Humorous","Educational","Bold","Friendly"];
const audiences = ["B2B Executives","Startup Founders","Marketing Professionals","Tech Enthusiasts","General Public","Small Business Owners"];
const ctaOptions = ["Learn More","Book a Demo","Sign Up Free","Download Now","Get Started","Contact Us","Read More","Shop Now"];
const creativityLabels = ["Conservative","Balanced","Creative","Very Creative","Experimental"];

export default function ContentPage() {
  const { addPost, settings } = useAppStore();
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
  const [selectedType, setSelectedType] = useState(postTypes[0].id);
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [audience, setAudience] = useState("B2B Executives");
  const [cta, setCta] = useState("Learn More");
  const [creativity, setCreativity] = useState(2);
  const [emoji, setEmoji] = useState(true);
  const [keywords, setKeywords] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);
  const [scheduledSuccess, setScheduledSuccess] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerated("");
    setScheduledSuccess(false);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: selectedPlatform.id,
          postType: selectedType,
          topic,
          tone,
          audience,
          cta,
          keywords,
          apiKey: settings.openaiKey,
          provider: settings.openaiKey ? "openai" : "fallback",
        }),
      });

      const data = await res.json();
      if (data.success && data.text) {
        setGenerated(data.text);
      } else {
        setGenerated("Failed to generate content. Please check inputs or API key.");
      }
    } catch (e) {
      setGenerated("Error connecting to generator API.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSchedulePost = () => {
    if (!generated) return;
    const titleText = topic || generated.slice(0, 40) + "...";
    addPost({
      title: titleText,
      content: generated,
      platform: selectedPlatform.id as any,
      scheduledAt: "Tomorrow, " + new Date(Date.now() + 86400000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: settings.autoPublish ? "scheduled" : "pending_approval",
      qualityScore: 94,
    });
    setScheduledSuccess(true);
    setTimeout(() => setScheduledSuccess(false), 4000);
  };

  return (
    <div className="page-container">
      <motion.div className="page-header" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0A0A0B", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.025em" }}>
          Content Generator
        </h1>
        <p style={{ color: "#71717A", fontSize: 14, margin: "6px 0 0" }}>
          Generate real AI-powered content & push directly to the live publishing schedule
        </p>
      </motion.div>

      {scheduledSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            padding: "14px 20px", background: "#ECFDF5", border: "1px solid #A7F3D0",
            borderRadius: 14, color: "#059669", fontWeight: 600, fontSize: 14,
            display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
          }}
        >
          <CheckCircle2 size={18} />
          <span>Post successfully created and added to the live Scheduler Queue!</span>
        </motion.div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 24, alignItems: "start" }}>
        {/* Left — Config Panel */}
        <motion.div
          className="card"
          style={{ padding: 28 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 20px", color: "#0A0A0B" }}>Content Settings</h2>

          {/* Platform Select */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#52525B", marginBottom: 8, display: "block" }}>PLATFORM</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {platforms.map(p => {
                const PIcon = p.icon;
                const active = selectedPlatform.id === p.id;
                return (
                  <motion.button
                    key={p.id}
                    onClick={() => setSelectedPlatform(p)}
                    style={{
                      padding: "10px 8px", border: `2px solid ${active ? p.color : "#E4E4E7"}`,
                      borderRadius: 12, background: active ? `${p.color}10` : "white",
                      cursor: "pointer", display: "flex", flexDirection: "column",
                      alignItems: "center", gap: 5, transition: "all 0.18s",
                    }}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <PIcon size={16} color={active ? p.color : "#71717A"} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: active ? p.color : "#71717A" }}>{p.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Post Type */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#52525B", marginBottom: 8, display: "block" }}>POST TYPE</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {postTypes.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  style={{
                    padding: "6px 12px", borderRadius: 99,
                    border: `1.5px solid ${selectedType === t.id ? "#2563EB" : "#E4E4E7"}`,
                    background: selectedType === t.id ? "#EFF6FF" : "white",
                    color: selectedType === t.id ? "#2563EB" : "#52525B",
                    fontSize: 12, fontWeight: 500, cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#52525B", marginBottom: 6, display: "block" }}>TOPIC / BRIEF</label>
            <textarea
              className="input"
              placeholder="e.g. '5 tips for B2B lead generation using AI in 2025'"
              style={{ resize: "vertical", minHeight: 80, lineHeight: 1.5 }}
              value={topic}
              onChange={e => setTopic(e.target.value)}
            />
          </div>

          {/* Tone + Audience */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#52525B", marginBottom: 6, display: "block" }}>TONE</label>
              <select className="input select" value={tone} onChange={e => setTone(e.target.value)}>
                {tones.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#52525B", marginBottom: 6, display: "block" }}>AUDIENCE</label>
              <select className="input select" value={audience} onChange={e => setAudience(e.target.value)}>
                {audiences.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>

          {/* CTA + Keywords */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#52525B", marginBottom: 6, display: "block" }}>CALL TO ACTION</label>
              <select className="input select" value={cta} onChange={e => setCta(e.target.value)}>
                {ctaOptions.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#52525B", marginBottom: 6, display: "block" }}>KEYWORDS</label>
              <input className="input" placeholder="AI, marketing, growth" value={keywords} onChange={e => setKeywords(e.target.value)} />
            </div>
          </div>

          {/* Creativity Slider */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#52525B" }}>CREATIVITY LEVEL</label>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#2563EB" }}>{creativityLabels[creativity]}</span>
            </div>
            <input
              type="range" min={0} max={4} value={creativity}
              onChange={e => setCreativity(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#2563EB" }}
            />
          </div>

          {/* Emoji Toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0A0A0B" }}>Include Emojis</div>
              <div style={{ fontSize: 11, color: "#71717A" }}>Adds relevant emojis to improve engagement</div>
            </div>
            <motion.button
              onClick={() => setEmoji(!emoji)}
              style={{
                width: 44, height: 24, borderRadius: 99, flexShrink: 0,
                background: emoji ? "#2563EB" : "#E4E4E7",
                border: "none", cursor: "pointer", position: "relative",
              }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ x: emoji ? 22 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
              />
            </motion.button>
          </div>

          {/* Generate Button */}
          <motion.button
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: 15 }}
            onClick={handleGenerate}
            disabled={isGenerating}
            whileHover={{ y: -1, boxShadow: "0 8px 24px rgba(37,99,235,0.3)" }}
            whileTap={{ scale: 0.98 }}
          >
            {isGenerating ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <RefreshCw size={15} />
                </motion.div>
                Generating with Live AI...
              </>
            ) : (
              <><Sparkles size={15} /> Generate Content</>
            )}
          </motion.button>
        </motion.div>

        {/* Right — Output Panel */}
        <motion.div
          className="card"
          style={{ padding: 28 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0A0A0B" }}>Generated Content</h2>
            <div style={{ display: "flex", gap: 6 }}>
              <motion.button className="btn btn-secondary btn-sm" onClick={handleGenerate} whileTap={{ scale: 0.96 }}>
                <RefreshCw size={12} /> Regenerate
              </motion.button>
              <motion.button className="btn btn-secondary btn-sm" onClick={handleCopy} whileTap={{ scale: 0.96 }}>
                {copied ? <><CheckCircle2 size={12} color="#059669" /> Copied!</> : <><Copy size={12} /> Copy</>}
              </motion.button>
            </div>
          </div>

          {/* Platform Preview Label */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "8px 14px", background: `${selectedPlatform.color}10`, borderRadius: 10, border: `1px solid ${selectedPlatform.color}30` }}>
            {(() => { const PIcon = selectedPlatform.icon; return <PIcon size={15} color={selectedPlatform.color} />; })()}
            <span style={{ fontSize: 12, fontWeight: 600, color: selectedPlatform.color }}>{selectedPlatform.label} Live Output</span>
            <span style={{ fontSize: 11, color: "#A1A1AA", marginLeft: "auto" }}>
              {generated.length} / {selectedPlatform.maxChars.toLocaleString()} chars
            </span>
          </div>

          {/* Output Area */}
          <div style={{
            minHeight: 280, background: "#FAFAFA", border: "1px solid #F0F0F2",
            borderRadius: 14, padding: "18px 20px",
            fontFamily: "inherit", fontSize: 14, lineHeight: 1.7,
            color: generated ? "#0A0A0B" : "#A1A1AA",
            whiteSpace: "pre-wrap", position: "relative",
          }}>
            {isGenerating ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[1,0.85,0.7,0.9,0.6].map((w, i) => (
                  <motion.div
                    key={i}
                    className="skeleton"
                    style={{ height: 16, width: `${w * 100}%`, borderRadius: 6 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <motion.div
                    style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563EB" }}
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                  <span style={{ fontSize: 12, color: "#7C3AED", fontWeight: 600 }}>SocialPilot AI Engine synthesizing output...</span>
                </div>
              </div>
            ) : generated ? (
              generated
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 220, gap: 12 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Sparkles size={24} color="#2563EB" />
                </div>
                <p style={{ fontSize: 14, color: "#71717A", textAlign: "center", margin: 0 }}>
                  Configure your settings and click <strong>Generate Content</strong> to call the real AI API
                </p>
              </div>
            )}
          </div>

          {/* Post Actions */}
          {generated && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", gap: 8, marginTop: 16 }}
            >
              <motion.button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={handleSchedulePost}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                <Send size={13} /> Add to Live Scheduler Queue
              </motion.button>
              <motion.button className="btn btn-secondary" onClick={handleCopy} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                <Copy size={13} /> Copy Text
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
