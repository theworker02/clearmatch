import React from "react";
import { Tooltip } from "./Tooltip";

export type BadgeVariant =
  | "serious"
  | "casual"
  | "exploring"
  | "introvert"
  | "extrovert"
  | "active"
  | "homebody"
  | "verified"
  | "highMatch"
  | "personality"
  | "neutral";

export function Badge({ children, variant = "neutral", title }: { children: React.ReactNode; variant?: BadgeVariant; title?: string }) {
  const badge = React.createElement("span", { className: `badge ${variant}` }, children);
  return title ? React.createElement(Tooltip, { text: title }, badge) : badge;
}
