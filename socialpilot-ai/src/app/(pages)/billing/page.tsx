"use client";

import { motion } from "framer-motion";
import { Check, Zap, ArrowUpRight, CreditCard, BarChart2 } from "lucide-react";

const plans = [
  {
    id: "starter", name: "Starter", price: 49, period: "mo", color: "#71717A",
    features: ["5 Social Accounts","3 AI Agents","1,000 AI Credits/mo","Basic Analytics","Email Support"],
  },
  {
    id: "pro", name: "Pro", price: 149, period: "mo", color: "#2563EB", popular: true,
    features: ["25 Social Accounts","10 AI Agents","10,000 AI Credits/mo","Advanced Analytics","Priority Support","Automation Builder","Custom Brand Voice"],
  },
  {
    id: "enterprise", name: "Enterprise", price: 499, period: "mo", color: "#7C3AED",
    features: ["Unlimited Accounts","All 19 AI Agents","100,000 AI Credits/mo","Full Analytics Suite","Dedicated Support","White Label","API Access","Custom Integrations"],
  },
];

export default function BillingPage() {
  return (
    <div className="page-container">
      <motion.div className="page-header" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0A0A0B", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.025em" }}>
          Billing & Plans
        </h1>
        <p style={{ color: "#71717A", fontSize: 14, margin: "6px 0 0" }}>Manage your subscription, usage, and invoices</p>
      </motion.div>

      {/* Current Usage */}
      <motion.div className="card" style={{ padding: 24, marginBottom: 28 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0A0A0B" }}>Current Plan: <span style={{ color: "#2563EB" }}>Pro</span></div>
            <div style={{ fontSize: 12, color: "#71717A", marginTop: 2 }}>Renews on August 23, 2025 · $149/mo</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <motion.button className="btn btn-secondary btn-sm" whileHover={{ y: -1 }}><CreditCard size={13} /> Update Payment</motion.button>
            <motion.button className="btn btn-primary btn-sm" whileHover={{ y: -1 }}><Zap size={13} /> Upgrade Plan</motion.button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { label: "AI Credits Used", used: 51800, total: 100000, color: "#2563EB" },
            { label: "Accounts Connected", used: 8, total: 25, color: "#7C3AED" },
            { label: "Agents Active", used: 19, total: 19, color: "#059669" },
          ].map(m => (
            <div key={m.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#0A0A0B" }}>{m.label}</span>
                <span style={{ fontSize: 12, color: "#71717A" }}>{m.used.toLocaleString()} / {m.total.toLocaleString()}</span>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  style={{ background: m.color, width: 0 }}
                  animate={{ width: `${(m.used / m.total) * 100}%` }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Plans */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 32 }}>
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            style={{
              padding: 28, borderRadius: 20,
              border: `2px solid ${plan.popular ? plan.color : "#E4E4E7"}`,
              background: plan.popular ? `linear-gradient(135deg, ${plan.color}08, ${plan.color}03)` : "white",
              position: "relative",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
          >
            {plan.popular && (
              <div style={{
                position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                background: plan.color, color: "white", fontSize: 11, fontWeight: 700,
                padding: "4px 16px", borderRadius: 99,
              }}>
                MOST POPULAR
              </div>
            )}
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0A0A0B", marginBottom: 8 }}>{plan.name}</div>
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: plan.color, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.04em" }}>${plan.price}</span>
              <span style={{ fontSize: 14, color: "#71717A" }}>/{plan.period}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {plan.features.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#52525B" }}>
                  <Check size={14} color={plan.color} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>
            <motion.button
              style={{
                width: "100%", padding: "11px", borderRadius: 12,
                background: plan.popular ? plan.color : "transparent",
                border: `2px solid ${plan.color}`,
                color: plan.popular ? "white" : plan.color,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}
              whileHover={{ y: -1, boxShadow: plan.popular ? `0 8px 24px ${plan.color}40` : "none" }}
              whileTap={{ scale: 0.97 }}
            >
              {plan.id === "pro" ? "Current Plan" : "Switch Plan"}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
