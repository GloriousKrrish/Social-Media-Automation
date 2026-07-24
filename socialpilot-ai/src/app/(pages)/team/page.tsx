"use client";

import { motion } from "framer-motion";
import { teamMembers } from "@/lib/mock-data";
import { Plus, Mail, Shield, MoreHorizontal, Crown, Edit2, Trash2, Users } from "lucide-react";

const roles = ["Admin","Content Manager","Analyst","Designer","Viewer"];
const roleColors: Record<string, string> = {
  Admin: "blue", "Content Manager": "violet", Analyst: "emerald", Designer: "gold", Viewer: "gray",
};

export default function TeamPage() {
  return (
    <div className="page-container">
      <motion.div className="page-header" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0A0A0B", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.025em" }}>
              Team Members
            </h1>
            <p style={{ color: "#71717A", fontSize: 14, margin: "6px 0 0" }}>
              {teamMembers.length} members · Manage roles and permissions
            </p>
          </div>
          <motion.button className="btn btn-primary" whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
            <Plus size={14} /> Invite Member
          </motion.button>
        </div>
      </motion.div>

      {/* Permissions Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 28 }}>
        {roles.map((role, i) => (
          <motion.div
            key={role}
            className="card"
            style={{ padding: "16px 18px", textAlign: "center", cursor: "pointer" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -2 }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>
              {role === "Admin" ? "👑" : role === "Content Manager" ? "✍️" : role === "Analyst" ? "📊" : role === "Designer" ? "🎨" : "👁️"}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0A0A0B" }}>{role}</div>
            <div style={{ fontSize: 11, color: "#71717A", marginTop: 2 }}>
              {teamMembers.filter(m => m.role === role).length} member{teamMembers.filter(m => m.role === role).length !== 1 ? "s" : ""}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Members Table */}
      <motion.div
        className="card"
        style={{ overflow: "hidden" }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #F0F0F2", display: "flex", alignItems: "center", gap: 12 }}>
          <Users size={16} color="#71717A" />
          <span style={{ fontSize: 15, fontWeight: 700, color: "#0A0A0B" }}>All Members</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #F0F0F2" }}>
              {["Member","Role","Email","Status","Actions"].map(h => (
                <th key={h} style={{ padding: "12px 24px", fontSize: 11, fontWeight: 600, color: "#A1A1AA", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member, i) => (
              <motion.tr
                key={member.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.06 }}
                style={{ borderBottom: "1px solid #F9F9F9" }}
              >
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>{member.avatar}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#0A0A0B" }}>{member.name}</span>
                    {member.role === "Admin" && <Crown size={13} color="#D97706" />}
                  </div>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <span className={`badge badge-${roleColors[member.role] ?? "gray"}`} style={{ fontSize: 11 }}>
                    {member.role}
                  </span>
                </td>
                <td style={{ padding: "16px 24px", fontSize: 13, color: "#52525B" }}>
                  {member.email}
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div className={`status-dot ${member.status === "active" ? "status-active" : "status-idle"}`} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: member.status === "active" ? "#059669" : "#71717A", textTransform: "capitalize" }}>
                      {member.status}
                    </span>
                  </div>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <motion.button className="btn btn-ghost btn-icon" style={{ padding: 7 }} whileTap={{ scale: 0.9 }}>
                      <Edit2 size={13} color="#71717A" />
                    </motion.button>
                    <motion.button className="btn btn-ghost btn-icon" style={{ padding: 7 }} whileTap={{ scale: 0.9 }}>
                      <Mail size={13} color="#71717A" />
                    </motion.button>
                    <motion.button className="btn btn-ghost btn-icon" style={{ padding: 7 }} whileTap={{ scale: 0.9 }}>
                      <Trash2 size={13} color="#DC2626" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
