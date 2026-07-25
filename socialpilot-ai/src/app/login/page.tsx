"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Bot,
  Zap,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Activity,
  TrendingUp,
  Globe,
  Layers,
  ChevronRight,
} from "lucide-react";
import { signInWithSupabase, signUpWithSupabase, resetSupabasePassword, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

const capabilities = [
  {
    id: "agents",
    badge: "Autonomous AI Fleet",
    title: "AI Agents Working 24/7 For Your Brand",
    description: "Orchestrate specialized AI agents to generate tailored content calendars, design brand assets, and automate channel distribution.",
    icon: Bot,
    stats: "12 Agents Active",
    metric: "+94.8% Growth",
    color: "#2563EB",
    gradient: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
  },
  {
    id: "scheduler",
    badge: "Intelligent Queue",
    title: "Smart Multi-Platform Auto Scheduling",
    description: "Schedule & publish seamlessly across LinkedIn, X/Twitter, Instagram, Facebook, and TikTok at optimal audience peak times.",
    icon: Calendar,
    stats: "1,420 Posts Sent",
    metric: "100% On-Time",
    color: "#059669",
    gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)",
  },
  {
    id: "automation",
    badge: "Workflow Engine",
    title: "Visual Drag & Drop Automation Builder",
    description: "Connect approval gates, Slack alerts, AI review passes, and live webhooks using our interactive ReactFlow canvas.",
    icon: Zap,
    stats: "48 Workflows Active",
    metric: "0.2s Response",
    color: "#7C3AED",
    gradient: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [activeSlide, setActiveSlide] = useState(0);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Auto-rotate capability slides
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % capabilities.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await signInWithSupabase(email, password);
        if (error) throw error;

        if (data.session && data.user) {
          login(data.session.access_token, {
            id: data.user.id,
            email: data.user.email || email,
            full_name: data.user.user_metadata?.full_name || "User",
            is_active: true,
            is_verified: true,
          });
          router.push("/dashboard");
          return;
        }
      }

      // Local fallback sign-in
      login("mock_access_token_socialpilot", {
        id: "usr-demo",
        email: email || "alex.designer@socialpilot.ai",
        full_name: "Alex Rivera",
        is_active: true,
        is_verified: true,
      });
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await signUpWithSupabase(email, password, fullName);
        if (error) throw error;

        if (data.user) {
          setSuccessMsg("Account created successfully! Checking session...");
          if (data.session) {
            login(data.session.access_token, {
              id: data.user.id,
              email: data.user.email || email,
              full_name: fullName || "User",
              is_active: true,
              is_verified: true,
            });
            setTimeout(() => router.push("/dashboard"), 1000);
            return;
          } else {
            setSuccessMsg("Verification email sent! Please check your inbox.");
          }
        }
      } else {
        login("mock_access_token_socialpilot", {
          id: "usr-new",
          email,
          full_name: fullName || "New User",
          is_active: true,
          is_verified: true,
        });
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { error } = await resetSupabasePassword(email);
        if (error) throw error;
      }
      setSuccessMsg("Password reset link has been dispatched to your email address!");
    } catch (err: any) {
      setErrorMsg(err.message || "Unable to send password reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = () => {
    login("demo_token_express", {
      id: "usr-demo",
      email: "demo@socialpilot.ai",
      full_name: "Alex Rivera",
      is_active: true,
      is_verified: true,
    });
    router.push("/dashboard");
  };

  const currentCap = capabilities[activeSlide];
  const CapIcon = currentCap.icon;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#090A0F",
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        color: "#FFFFFF",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Background Ambient Glow & Grid Lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle at 20% 20%, rgba(37, 99, 235, 0.15) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(124, 58, 237, 0.12) 0%, transparent 40%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
          opacity: 0.6,
        }}
      />

      {/* LEFT COLUMN: Feature Showcase & Capabilities */}
      <div
        style={{
          flex: 1.2,
          padding: "60px 80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Brand Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(37, 99, 235, 0.4)",
            }}
          >
            <Sparkles size={22} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em", color: "#FFFFFF" }}>
              SocialPilot <span style={{ color: "#38BDF8" }}>AI</span>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
              Enterprise Social Automation Infrastructure
            </div>
          </div>
        </div>

        {/* Dynamic Capability Cards Slider */}
        <div style={{ marginTop: "auto", marginBottom: "auto", position: "relative" }}>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentCap.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {/* Badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 16px",
                  borderRadius: 99,
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  backdropFilter: "blur(12px)",
                  marginBottom: 24,
                }}
              >
                <CapIcon size={16} color={currentCap.color} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0" }}>{currentCap.badge}</span>
              </div>

              {/* Title & Description */}
              <h2
                style={{
                  fontSize: 38,
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: "-0.03em",
                  marginBottom: 16,
                  color: "#FFFFFF",
                  maxWidth: 540,
                }}
              >
                {currentCap.title}
              </h2>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: "#94A3B8",
                  maxWidth: 480,
                  marginBottom: 36,
                }}
              >
                {currentCap.description}
              </p>

              {/* Interactive Floating Metric Pill Cards */}
              <div style={{ display: "flex", gap: 16 }}>
                <div
                  style={{
                    padding: "16px 20px",
                    borderRadius: 16,
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>SYSTEM STATUS</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#F8FAFC", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <Activity size={16} color="#10B981" /> {currentCap.stats}
                  </div>
                </div>

                <div
                  style={{
                    padding: "16px 20px",
                    borderRadius: 16,
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>PERFORMANCE GAIN</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#10B981", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <TrendingUp size={16} /> {currentCap.metric}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slide Indicator Dots */}
          <div style={{ display: "flex", gap: 8, marginTop: 40 }}>
            {capabilities.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setActiveSlide(i)}
                style={{
                  width: activeSlide === i ? 32 : 10,
                  height: 10,
                  borderRadius: 99,
                  background: activeSlide === i ? "#2563EB" : "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        </div>

        {/* Capability Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 13, color: "#64748B" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <ShieldCheck size={16} color="#10B981" /> Supabase Encryption
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Globe size={16} color="#38BDF8" /> Multi-Tenant Workspaces
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Layers size={16} color="#A855F7" /> Realtime Webhooks
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Form & Authentication */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 60,
          position: "relative",
          zIndex: 1,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            width: "100%",
            maxWidth: 460,
            background: "rgba(15, 23, 42, 0.75)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 24,
            padding: 40,
            boxShadow: "0 32px 64px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Header & Tab Selector */}
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: "#F8FAFC", margin: 0, letterSpacing: "-0.02em" }}>
              {mode === "signin" && "Welcome back"}
              {mode === "signup" && "Create your account"}
              {mode === "forgot" && "Reset your password"}
            </h3>
            <p style={{ fontSize: 14, color: "#94A3B8", margin: "6px 0 0" }}>
              {mode === "signin" && "Access your AI agents and real-time social metrics"}
              {mode === "signup" && "Start automating your social channels with AI"}
              {mode === "forgot" && "Enter your email to receive a secure recovery link"}
            </p>

            {/* Segmented Mode Selector */}
            {mode !== "forgot" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 4,
                  padding: 4,
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: 14,
                  marginTop: 24,
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <button
                  onClick={() => { setMode("signin"); setErrorMsg(""); setSuccessMsg(""); }}
                  style={{
                    padding: "10px 0",
                    border: "none",
                    borderRadius: 10,
                    background: mode === "signin" ? "#2563EB" : "transparent",
                    color: mode === "signin" ? "#FFFFFF" : "#94A3B8",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMode("signup"); setErrorMsg(""); setSuccessMsg(""); }}
                  style={{
                    padding: "10px 0",
                    border: "none",
                    borderRadius: 10,
                    background: mode === "signup" ? "#2563EB" : "transparent",
                    color: mode === "signup" ? "#FFFFFF" : "#94A3B8",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#FCA5A5",
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#6EE7B7",
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* Forms */}
          <form onSubmit={mode === "signin" ? handleSignIn : mode === "signup" ? handleSignUp : handleForgotPassword}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Full Name Input (Sign Up Mode) */}
              {mode === "signup" && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#CBD5E1", marginBottom: 6, display: "block" }}>
                    Full Name
                  </label>
                  <div style={{ position: "relative" }}>
                    <User size={16} color="#64748B" style={{ position: "absolute", left: 14, top: 14 }} />
                    <input
                      type="text"
                      required
                      placeholder="Alex Rivera"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 14px 12px 42px",
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: 12,
                        color: "#FFFFFF",
                        fontSize: 14,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#CBD5E1", marginBottom: 6, display: "block" }}>
                  Work Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} color="#64748B" style={{ position: "absolute", left: 14, top: 14 }} />
                  <input
                    type="email"
                    required
                    placeholder="alex@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px 12px 42px",
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: 12,
                      color: "#FFFFFF",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Password Input (Sign In / Sign Up Mode) */}
              {mode !== "forgot" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#CBD5E1" }}>Password</label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        onClick={() => { setMode("forgot"); setErrorMsg(""); setSuccessMsg(""); }}
                        style={{ background: "none", border: "none", color: "#38BDF8", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div style={{ position: "relative" }}>
                    <Lock size={16} color="#64748B" style={{ position: "absolute", left: 14, top: 14 }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 44px 12px 42px",
                        background: "rgba(15, 23, 42, 0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: 12,
                        color: "#FFFFFF",
                        fontSize: 14,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: 14, top: 14, background: "none", border: "none", cursor: "pointer", display: "flex" }}
                    >
                      {showPassword ? <EyeOff size={16} color="#64748B" /> : <Eye size={16} color="#64748B" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Remember Me Checkbox */}
              {mode === "signin" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ borderRadius: 4, cursor: "pointer" }}
                  />
                  <label htmlFor="remember" style={{ fontSize: 13, color: "#94A3B8", cursor: "pointer" }}>
                    Keep me signed in for 30 days
                  </label>
                </div>
              )}

              {/* Action Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: "100%",
                  padding: "14px 0",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                  color: "#FFFFFF",
                  fontSize: 15,
                  fontWeight: 700,
                  border: "none",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  marginTop: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 8px 24px rgba(37, 99, 235, 0.35)",
                }}
              >
                {isLoading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>
                      {mode === "signin" && "Sign In to Dashboard"}
                      {mode === "signup" && "Create Free Workspace"}
                      {mode === "forgot" && "Send Reset Link"}
                    </span>
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>

              {/* Back to Sign In Link (Forgot Password mode) */}
              {mode === "forgot" && (
                <button
                  type="button"
                  onClick={() => { setMode("signin"); setErrorMsg(""); setSuccessMsg(""); }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94A3B8",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    marginTop: 8,
                    textAlign: "center",
                  }}
                >
                  ← Back to Sign In
                </button>
              )}
            </div>
          </form>

          {/* Quick Demo Access Bar */}
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(255, 255, 255, 0.08)", textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>Want to explore the platform right away?</div>
            <motion.button
              type="button"
              onClick={handleDemoAccess}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              style={{
                width: "100%",
                padding: "10px 0",
                borderRadius: 10,
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#E2E8F0",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Sparkles size={14} color="#38BDF8" />
              <span>Explore Demo Workspace</span>
              <ChevronRight size={14} color="#64748B" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
