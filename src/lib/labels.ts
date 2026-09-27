import { BusinessStage, Priority, TaskStatus } from "@prisma/client";

/** Soft "select tag" styling: light tinted background, darker text. */
type Tag = { label: string; pill: string; dot: string };

export const statusLabels: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export const statusConfig: Record<TaskStatus, Tag> = {
  TODO: { label: "To Do", pill: "bg-chip text-ink-muted", dot: "bg-ink-faint" },
  IN_PROGRESS: {
    label: "In Progress",
    pill: "bg-primary-light text-primary-ink",
    dot: "bg-primary-ink",
  },
  DONE: { label: "Done", pill: "bg-success-light text-success", dot: "bg-success" },
};

export const priorityConfig: Record<Priority, Tag> = {
  LOW: { label: "Low", pill: "bg-chip text-ink-muted", dot: "bg-ink-faint" },
  MEDIUM: { label: "Medium", pill: "bg-accent-light text-accent", dot: "bg-accent" },
  HIGH: { label: "High", pill: "bg-danger-light text-danger", dot: "bg-danger" },
};

export const stageConfig: Record<BusinessStage, Tag> = {
  PROSPECTING: { label: "Prospecting", pill: "bg-chip text-ink-muted", dot: "bg-ink-faint" },
  CONTACTED: {
    label: "Contacted",
    pill: "bg-primary-light text-primary-ink",
    dot: "bg-primary-ink",
  },
  NEGOTIATING: { label: "Negotiating", pill: "bg-accent-light text-accent", dot: "bg-accent" },
  WON: { label: "Won", pill: "bg-success-light text-success", dot: "bg-success" },
  LOST: { label: "Lost", pill: "bg-danger-light text-danger", dot: "bg-danger" },
};
