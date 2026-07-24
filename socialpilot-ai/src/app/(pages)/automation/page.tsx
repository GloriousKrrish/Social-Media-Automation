"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type NodeTypes,
  type Node,
  Handle,
  Position,
  type NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Zap,
  Play,
  Save,
  Search,
  ChevronRight,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Send,
  Webhook,
  Filter,
  CheckSquare,
  MessageSquare,
  X,
  Sliders,
  Sparkles,
} from "lucide-react";
import { NodeExecutionStatus } from "@/types/core";

// Node Configuration Map
const nodeTypes_config = [
  {
    category: "Triggers",
    color: "#3C2A21",
    items: [
      { type: "schedule", label: "Schedule Trigger", icon: Clock, desc: "Run on specified cron schedule" },
      { type: "webhook", label: "Webhook Trigger", icon: Webhook, desc: "Trigger on incoming HTTP payload" },
      { type: "drafted", label: "New Post Drafted", icon: Zap, desc: "Trigger when editor drafts post" },
    ],
  },
  {
    category: "Actions",
    color: "#C88A58",
    items: [
      { type: "slack", label: "Send Slack Notification", icon: MessageSquare, desc: "Post alert to Slack channel" },
      { type: "publish_x", label: "Publish to X / Twitter", icon: Send, desc: "Directly post thread or tweet" },
      { type: "request_approval", label: "Request Approval", icon: CheckSquare, desc: "Require manager approval" },
    ],
  },
  {
    category: "Conditions",
    color: "#D4AF37",
    items: [
      { type: "if_approved", label: "If Approved Gate", icon: CheckCircle2, desc: "Branch if approved by manager" },
      { type: "filter_tag", label: "Filter by Tag", icon: Filter, desc: "Filter campaign content by tag" },
    ],
  },
];

// Custom Flow Node Render Component
function CustomWorkflowNode({ data, selected }: NodeProps) {
  const isTrigger = data.category === "trigger";
  const isCondition = data.category === "condition";

  const getStatusBadge = (status: NodeExecutionStatus) => {
    switch (status) {
      case "running":
        return { label: "Running...", bg: "#FAF2EC", color: "#C88A58", dot: "#C88A58" };
      case "success":
        return { label: "Success 🟢", bg: "#F2F7F4", color: "#4A7A5D", dot: "#4A7A5D" };
      case "error":
        return { label: "Error 🔴", bg: "#FDF4F4", color: "#A85858", dot: "#A85858" };
      default:
        return { label: "Idle", bg: "#F7F3ED", color: "#6E6259", dot: "#A3968C" };
    }
  };

  const statusBadge = getStatusBadge(data.executionStatus || "idle");

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: `2px solid ${selected ? "#3C2A21" : "#EAE4DC"}`,
        borderRadius: 14,
        minWidth: 200,
        boxShadow: selected ? "0 8px 24px rgba(60, 42, 33, 0.15)" : "0 2px 8px rgba(60, 42, 33, 0.05)",
        transition: "all 0.2s ease",
        overflow: "hidden",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ width: 10, height: 10, background: "#3C2A21" }} />

      {/* Header */}
      <div
        style={{
          background: isTrigger ? "#3C2A21" : isCondition ? "#D4AF37" : "#C88A58",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "#FFFFFF",
        }}
      >
        <Zap size={14} />
        <span style={{ fontSize: 12, fontWeight: 700 }}>{data.label}</span>
      </div>

      {/* Body */}
      <div style={{ padding: "10px 12px" }}>
        <p style={{ fontSize: 11, color: "#6E6259", margin: "0 0 6px" }}>{data.description || "Workflow step"}</p>

        {/* Execution Status Badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 12,
              background: statusBadge.bg,
              color: statusBadge.color,
            }}
          >
            {statusBadge.label}
          </span>
          <span style={{ fontSize: 10, color: "#A3968C" }}>Step ID: {data.nodeId || "1"}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ width: 10, height: 10, background: "#3C2A21" }} />
    </div>
  );
}

const nodeTypes: NodeTypes = { customWorkflowNode: CustomWorkflowNode };

const initialNodes: Node<any>[] = [
  {
    id: "node-1",
    type: "customWorkflowNode",
    position: { x: 300, y: 50 },
    data: {
      nodeId: "1",
      category: "trigger",
      label: "Schedule Trigger",
      description: "Runs every Monday at 09:00 AM",
      executionStatus: "idle",
      config: { cron: "0 9 * * 1", channel: "LinkedIn" },
    },
  },
  {
    id: "node-2",
    type: "customWorkflowNode",
    position: { x: 300, y: 220 },
    data: {
      nodeId: "2",
      category: "action",
      label: "Send Slack Notification",
      description: "Alert marketing team in #content-queue",
      executionStatus: "idle",
      config: { channel: "#content-queue", message: "Draft ready for review" },
    },
  },
  {
    id: "node-3",
    type: "customWorkflowNode",
    position: { x: 300, y: 390 },
    data: {
      nodeId: "3",
      category: "condition",
      label: "If Approved Gate",
      description: "Check if manager approved draft",
      executionStatus: "idle",
      config: { requireRole: "Admin" },
    },
  },
  {
    id: "node-4",
    type: "customWorkflowNode",
    position: { x: 300, y: 560 },
    data: {
      nodeId: "4",
      category: "action",
      label: "Publish to X / Twitter",
      description: "Auto-publish post to official X handle",
      executionStatus: "idle",
      config: { platform: "X/Twitter", autoRetweet: true },
    },
  },
];

const initialEdges = [
  { id: "e1-2", source: "node-1", target: "node-2", animated: false, style: { stroke: "#3C2A21", strokeWidth: 2 } },
  { id: "e2-3", source: "node-2", target: "node-3", animated: false, style: { stroke: "#3C2A21", strokeWidth: 2 } },
  { id: "e3-4", source: "node-3", target: "node-4", animated: false, style: { stroke: "#3C2A21", strokeWidth: 2 } },
];

export default function AutomationPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [isRunningSimulation, setIsRunningSimulation] = useState(false);
  const [simulationStepInfo, setSimulationStepInfo] = useState<string | null>(null);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    [setEdges]
  );

  const handleNodeClick = (_: any, node: any) => {
    setSelectedNode(node);
  };

  // Workflow Runner Simulation Engine (🟡 Running -> 🟢 Success / 🔴 Error)
  const handleTestWorkflowRun = async () => {
    setIsRunningSimulation(true);
    setSimulationStepInfo("Starting live workflow simulation preview...");

    // Reset all nodes to idle
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, executionStatus: "idle" } })));

    // Step by step node execution simulation
    for (let i = 0; i < nodes.length; i++) {
      const targetId = nodes[i].id;
      const label = nodes[i].data.label;

      setSimulationStepInfo(`Running Step [${i + 1}/${nodes.length}]: ${label}...`);

      // Set node to running (🟡)
      setNodes((nds) =>
        nds.map((n) => (n.id === targetId ? { ...n, data: { ...n.data, executionStatus: "running" } } : n))
      );

      // Animate edge
      setEdges((eds) =>
        eds.map((e) => (e.source === targetId ? { ...e, animated: true } : e))
      );

      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mark success (🟢)
      setNodes((nds) =>
        nds.map((n) => (n.id === targetId ? { ...n, data: { ...n.data, executionStatus: "success" } } : n))
      );
    }

    setSimulationStepInfo("Workflow simulation completed successfully! All steps verified.");
    setIsRunningSimulation(false);
  };

  return (
    <div style={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column", background: "#FDFBF7" }}>
      {/* Action Toolbar */}
      <div
        style={{
          padding: "12px 24px",
          background: "#FFFFFF",
          borderBottom: "1px solid #EAE4DC",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#1C1613" }}>Visual Automation Builder</span>
          <span style={{ fontSize: 12, color: "#6E6259", background: "#F7F3ED", padding: "3px 10px", borderRadius: 12, fontWeight: 600 }}>
            {simulationStepInfo || `${nodes.length} active canvas nodes`}
          </span>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleTestWorkflowRun}
            disabled={isRunningSimulation}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: 8,
              background: isRunningSimulation ? "#C88A58" : "#3C2A21",
              color: "#FFFFFF",
              border: "none",
              fontSize: 13,
              fontWeight: 700,
              cursor: isRunningSimulation ? "not-allowed" : "pointer",
              boxShadow: "0 2px 8px rgba(60, 42, 33, 0.2)",
            }}
          >
            {isRunningSimulation ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
            {isRunningSimulation ? "Running Simulation..." : "Test / Run Workflow"}
          </button>
        </div>
      </div>

      {/* Main Builder Canvas Area */}
      <div style={{ flex: 1, display: "flex", position: "relative", overflow: "hidden" }}>
        {/* Node Library Sidebar */}
        <div
          style={{
            width: 240,
            background: "#FFFFFF",
            borderRight: "1px solid #EAE4DC",
            padding: 14,
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: "#A3968C", textTransform: "uppercase", marginBottom: 12 }}>
            Workflow Node Library
          </div>

          {nodeTypes_config.map((cat) => (
            <div key={cat.category} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: cat.color, marginBottom: 8 }}>{cat.category}</div>
              {cat.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.type}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: "#F7F3ED",
                      border: "1px solid #EAE4DC",
                      marginBottom: 6,
                      cursor: "grab",
                    }}
                  >
                    <Icon size={14} color={cat.color} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#1C1613" }}>{item.label}</div>
                      <div style={{ fontSize: 10, color: "#6E6259" }}>{item.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* ReactFlow Interactive Canvas */}
        <div style={{ flex: 1, position: "relative" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background color="#EAE4DC" gap={20} size={1} />
            <Controls style={{ borderRadius: 8 }} />
            <MiniMap style={{ borderRadius: 8 }} />
          </ReactFlow>
        </div>

        {/* Slide-Over Node Parameter Configuration Side Panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                width: 320,
                background: "#FFFFFF",
                borderLeft: "1px solid #EAE4DC",
                boxShadow: "-4px 0 16px rgba(60, 42, 33, 0.06)",
                padding: 20,
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                zIndex: 40,
                overflowY: "auto",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, borderBottom: "1px solid #F0EAE1", paddingBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14, color: "#1C1613" }}>
                  <Sliders size={16} color="#3C2A21" /> Configure Step
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  style={{ background: "#F7F3ED", border: "none", borderRadius: 6, padding: 4, cursor: "pointer" }}
                >
                  <X size={14} color="#6E6259" />
                </button>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#6E6259", display: "block", marginBottom: 4 }}>Node Label</label>
                <input
                  type="text"
                  value={selectedNode.data.label}
                  onChange={(e) => {
                    const newLabel = e.target.value;
                    setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, label: newLabel } });
                    setNodes((nds) =>
                      nds.map((n) => (n.id === selectedNode.id ? { ...n, data: { ...n.data, label: newLabel } } : n))
                    );
                  }}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #EAE4DC", fontSize: 13 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#6E6259", display: "block", marginBottom: 4 }}>Description</label>
                <textarea
                  rows={3}
                  value={selectedNode.data.description}
                  onChange={(e) => {
                    const newDesc = e.target.value;
                    setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, description: newDesc } });
                    setNodes((nds) =>
                      nds.map((n) => (n.id === selectedNode.id ? { ...n, data: { ...n.data, description: newDesc } } : n))
                    );
                  }}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #EAE4DC", fontSize: 13, resize: "none" }}
                />
              </div>

              <div style={{ background: "#F7F3ED", padding: 12, borderRadius: 8, fontSize: 12, color: "#6E6259" }}>
                <strong>Execution Status:</strong> {selectedNode.data.executionStatus || "idle"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
