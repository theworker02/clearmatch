import React from "react";
import { Tooltip } from "./Tooltip";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "icon";
  tooltip?: string;
};

export function Button({ variant = "primary", className = "", children, tooltip, ...props }: ButtonProps) {
  const variantClass = variant === "icon" ? "iconButton" : `${variant}Button`;
  const button = React.createElement("button", { ...props, className: `${variantClass} ${className}`.trim() }, children);
  return tooltip ? React.createElement(Tooltip, { text: tooltip }, button) : button;
}
