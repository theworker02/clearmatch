import React from "react";

export function ScreenContainer({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return React.createElement("section", { className: `screenContainer ${className}`.trim() }, children);
}
