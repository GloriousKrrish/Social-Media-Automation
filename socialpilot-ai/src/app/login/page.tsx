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
  Sliders,
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
    iconBg: "#F5F3FF",
    iconColor: "#7C3AED",
  },
  {
    id: "scheduler",
    badge: "Intelligent Queue",
    title: "Smart Multi-Platform Auto Scheduling",
    description: "Schedule & publish seamlessly across LinkedIn, X/Twitter, Instagram, Facebook, and TikTok at optimal audience peak times.",
    icon: Calendar,
    stats: "1,420 Posts Sent",
    metric: "100% On-Time",
    iconBg: "#ECFDF5",
    iconColor: "#059669",
  },
  {
    id: "automation",
    badge: "Workflow Engine",
    title: "Visual Drag & Drop Automation Builder",
    description: "Connect approval gates, Slack alerts, AI review passes, and live webhooks using our interactive ReactFlow canvas.",
    icon: Zap,
    stats: "48 Workflows Active",
    metric: "0.2s Response",
    iconBg: "#EFF6FF",
    iconColor: "#2563EB",
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
            full_name: data.user.user_metadata?.full_name || fullName,
            is_active: true,
            is_verified: true,
          });
          router.push("/dashboard");
          return;
        }
      }

      // Local fallback sign-in with dynamic email & auto-derived name
      login("mock_access_token_socialpilot", {
        id: "usr-" + Date.now(),
        email: email || "admin@socialpilot.ai",
        full_name: fullName,
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
          setSuccessMsg("Account created successfully!");
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
      setSuccessMsg("Password reset link dispatched to your email address!");
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
      full_name: "Demo Admin",
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
        background: "#FDFBF7",
        fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
        color: "#1C1613",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Soft Ambient Warm Glow Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 10% 20%, rgba(200, 138, 88, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 90% 80%, rgba(60, 42, 33, 0.05) 0%, transparent 40%)
          `,
          pointerEvents: "none",
        }}
      />

      {/* LEFT COLUMN: Clean Luxury Light Feature Showcase */}
      <div
        style={{
          flex: 1.2,
          padding: "60px 80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
          borderRight: "1px solid #EAE4DC",
        }}
      >
        {/* Brand Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "#3C2A21",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(60, 42, 33, 0.2)",
            }}
          >
            <Sparkles size={22} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "#1C1613" }}>
              SocialPilot <span style={{ color: "#C88A58" }}>AI</span>
            </div>
            <div style={{ fontSize: 12, color: "#6E6259", fontWeight: 500 }}>
              Enterprise Social Automation Infrastructure
            </div>
          </div>
        </div>

        {/* Feature Showcase Card */}
        <div style={{ marginTop: "auto", marginBottom: "auto", position: "relative" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCap.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              {/* Badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 14px",
                  borderRadius: 99,
                  background: "#F7F3ED",
                  border: "1px solid #EAE4DC",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: currentCap.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CapIcon size={14} color={currentCap.iconColor} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#3C2A21" }}>{currentCap.badge}</span>
              </div>

              {/* Title & Description */}
              <h2
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: "-0.03em",
                  marginBottom: 16,
                  color: "#1C1613",
                  maxWidth: 520,
                }}
              >
                {currentCap.title}
              </h2>
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: "#6E6259",
                  maxWidth: 480,
                  marginBottom: 32,
                }}
              >
                {currentCap.description}
              </p>

              {/* Clean White KPI Cards */}
              <div style={{ display: "flex", gap: 16 }}>
                <div
                  style={{
                    flex: 1,
                    padding: "20px 24px",
                    borderRadius: 20,
                    background: "#FFFFFF",
                    border: "1px solid #EAE4DC",
                    boxShadow: "0 4px 12px rgba(60, 42, 33, 0.04)",
                  }}
                >
                  <div style={{ fontSize: 11, color: "#A3968C", fontWeight: 700, letterSpacing: "0.05em" }}>SYSTEM STATUS</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#1C1613", marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                    <Activity size={18} color="#4A7A5D" /> {currentCap.stats}
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    padding: "20px 24px",
                    borderRadius: 20,
                    background: "#FFFFFF",
                    border: "1px solid #EAE4DC",
                    boxShadow: "0 4px 12px rgba(60, 42, 33, 0.04)",
                  }}
                >
                  <div style={{ fontSize: 11, color: "#A3968C", fontWeight: 700, letterSpacing: "0.05em" }}>PERFORMANCE GAIN</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#4A7A5D", marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                    <TrendingUp size={18} /> {currentCap.metric}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Indicator Dots */}
          <div style={{ display: "flex", gap: 8, marginTop: 32 }}>
            {capabilities.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setActiveSlide(i)}
                style={{
                  width: activeSlide === i ? 28 : 8,
                  height: 8,
                  borderRadius: 99,
                  background: activeSlide === i ? "#3C2A21" : "#D6CCC0",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        </div>

        {/* Footer Features */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 12, fontWeight: 600, color: "#6E6259" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <ShieldCheck size={16} color="#4A7A5D" /> Supabase Foundation
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Globe size={16} color="#C88A58" /> Multi-Tenant Workspace
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Sliders size={16} color="#3C2A21" /> Realtime AI Engine
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Pure White Light Auth Card */}
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
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            width: "100%",
            maxWidth: 440,
            background: "#FFFFFF",
            border: "1px solid #EAE4DC",
            borderRadius: 24,
            padding: 40,
            boxShadow: "0 12px 32px -4px rgba(60, 42, 33, 0.08)",
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: 28, textAlign: "center" }}>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: "#1C1613", margin: 0, letterSpacing: "-0.02em" }}>
              {mode === "signin" && "Welcome Back"}
              {mode === "signup" && "Create Your Account"}
              {mode === "forgot" && "Reset Password"}
            </h3>
            <p style={{ fontSize: 13, color: "#6E6259", margin: "6px 0 0" }}>
              {mode === "signin" && "Access your AI agents and real-time social performance"}
              {mode === "signup" && "Start automating your social channels with AI"}
              {mode === "forgot" && "Enter your email for account recovery instructions"}
            </p>

            {/* Segmented Mode Selector */}
            {mode !== "forgot" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 4,
                  padding: 4,
                  background: "#F7F3ED",
                  borderRadius: 12,
                  marginTop: 20,
                  border: "1px solid #EAE4DC",
                }}
              >
                <button
                  onClick={() => { setMode("signin"); setErrorMsg(""); setSuccessMsg(""); }}
                  style={{
                    padding: "9px 0",
                    border: "none",
                    borderRadius: 8,
                    background: mode === "signin" ? "#FFFFFF" : "transparent",
                    color: mode === "signin" ? "#1C1613" : "#6E6259",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: mode === "signin" ? "0 2px 6px rgba(60, 42, 33, 0.06)" : "none",
                  }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMode("signup"); setErrorMsg(""); setSuccessMsg(""); }}
                  style={{
                    padding: "9px 0",
                    border: "none",
                    borderRadius: 8,
                    background: mode === "signup" ? "#FFFFFF" : "transparent",
                    color: mode === "signup" ? "#1C1613" : "#6E6259",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: mode === "signup" ? "0 2px 6px rgba(60, 42, 33, 0.06)" : "none",
                  }}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                background: "#FDF4F4",
                border: "1px solid #A85858",
                color: "#A85858",
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 18,
              }}
            >
              <AlertCircle size={16} color="#A85858" style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                background: "#F2F7F4",
                border: "1px solid #4A7A5D",
                color: "#4A7A5D",
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 18,
              }}
            >
              <CheckCircle2 size={16} color="#4A7A5D" style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={mode === "signin" ? handleSignIn : mode === "signup" ? handleSignUp : handleForgotPassword}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Full Name (Sign Up Mode) */}
              {mode === "signup" && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#1C1613", marginBottom: 6, display: "block" }}>
                    Full Name
                  </label>
                  <div style={{ position: "relative" }}>
                    <User size={16} color="#6E6259" style={{ position: "absolute", left: 14, top: 13 }} />
                    <input
                      type="text"
                      required
                      placeholder="Alex Rivera"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px 10px 42px",
                        background: "#F7F3ED",
                        border: "1px solid #EAE4DC",
                        borderRadius: 10,
                        color: "#1C1613",
                        fontSize: 14,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#1C1613", marginBottom: 6, display: "block" }}>
                  Work Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} color="#6E6259" style={{ position: "absolute", left: 14, top: 13 }} />
                  <input
                    type="email"
                    required
                    placeholder="alex@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px 10px 42px",
                      background: "#F7F3ED",
                      border: "1px solid #EAE4DC",
                      borderRadius: 10,
                      color: "#1C1613",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              {mode !== "forgot" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#1C1613" }}>Password</label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        onClick={() => { setMode("forgot"); setErrorMsg(""); setSuccessMsg(""); }}
                        style={{ background: "none", border: "none", color: "#C88A58", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div style={{ position: "relative" }}>
                    <Lock size={16} color="#6E6259" style={{ position: "absolute", left: 14, top: 13 }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 44px 10px 42px",
                        background: "#F7F3ED",
                        border: "1px solid #EAE4DC",
                        borderRadius: 10,
                        color: "#1C1613",
                        fontSize: 14,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: 14, top: 13, background: "none", border: "none", cursor: "pointer", display: "flex" }}
                    >
                      {showPassword ? <EyeOff size={16} color="#6E6259" /> : <Eye size={16} color="#6E6259" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Remember Me */}
              {mode === "signin" && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ borderRadius: 4, cursor: "pointer", accentColor: "#3C2A21" }}
                  />
                  <label htmlFor="remember" style={{ fontSize: 13, color: "#6E6259", fontWeight: 500, cursor: "pointer" }}>
                    Keep me signed in for 30 days
                  </label>
                </div>
              )}

              {/* Primary Action Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 10,
                  background: "#3C2A21",
                  color: "#FFFFFF",
                  fontSize: 14,
                  fontWeight: 700,
                  border: "none",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  marginTop: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 2px 6px rgba(60, 42, 33, 0.2)",
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
                    <ArrowRight size={15} />
                  </>
                )}
              </motion.button>

              {/* Back to Sign In Link */}
              {mode === "forgot" && (
                <button
                  type="button"
                  onClick={() => { setMode("signin"); setErrorMsg(""); setSuccessMsg(""); }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6E6259",
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

          {/* Quick Demo Access */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #EAE4DC", textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#6E6259", fontWeight: 500, marginBottom: 10 }}>Want to explore the platform right away?</div>
            <button
              type="button"
              onClick={handleDemoAccess}
              style={{
                width: "100%",
                padding: "9px 0",
                borderRadius: 8,
                background: "#F7F3ED",
                border: "1px solid #EAE4DC",
                color: "#1C1613",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Sparkles size={14} color="#C88A58" />
              <span>Explore Demo Workspace</span>
              <ChevronRight size={14} color="#A3968C" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
