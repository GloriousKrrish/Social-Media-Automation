export type UserRole = "Admin" | "Editor" | "Viewer";

export interface Workspace {
  id: string;
  name: string;
  logo: string;
  plan: "Starter" | "Pro" | "Enterprise";
  role: UserRole;
  membersCount: number;
}

export interface QuickAction {
  id: string;
  label: string;
  iconName: string;
  roles: UserRole[];
  actionType: string;
}

export type ApprovalStatus = "draft" | "pending_approval" | "approved" | "rejected" | "failed";

export interface QueuedPost {
  id: string;
  title: string;
  content: string;
  platform: "linkedin" | "instagram" | "twitter" | "facebook" | "threads";
  scheduledAt: string;
  status: ApprovalStatus;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  failureReason?: string;
  failureLogSnippet?: string;
  retryCount: number;
  qualityScore: number;
}

export type CommandCategory = "agent" | "automation" | "template" | "navigation";

export interface CommandPaletteItem {
  id: string;
  title: string;
  description: string;
  category: CommandCategory;
  iconName: string;
  shortcut?: string;
  route?: string;
}

export type NodeType = "trigger" | "action" | "condition";

export type NodeExecutionStatus = "idle" | "running" | "success" | "error";

export interface AutomationNodeData {
  label: string;
  description: string;
  type: NodeType;
  config: Record<string, any>;
  executionStatus?: NodeExecutionStatus;
  iconName?: string;
}
