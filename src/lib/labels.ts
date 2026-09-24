import { BusinessStage, Priority, TaskStatus } from "@prisma/client";

export const statusLabels: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export const priorityConfig: Record<Priority, { label: string; dot: string; text: string }> = {
  LOW: { label: "Low", dot: "bg-ink-faint", text: "text-ink-muted" },
  MEDIUM: { label: "Medium", dot: "bg-accent", text: "text-accent" },
  HIGH: { label: "High", dot: "bg-danger", text: "text-danger" },
};

export const stageConfig: Record<
  BusinessStage,
  { label: string; bg: string; text: string }
> = {
  PROSPECTING: { label: "Prospecting", bg: "bg-line", text: "text-ink-muted" },
  CONTACTED: { label: "Contacted", bg: "bg-primary-light", text: "text-primary" },
  NEGOTIATING: { label: "Negotiating", bg: "bg-accent-light", text: "text-accent" },
  WON: { label: "Won", bg: "bg-success-light", text: "text-success" },
  LOST: { label: "Lost", bg: "bg-danger-light", text: "text-danger" },
};
