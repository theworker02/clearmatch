import React from "react";

type CardProps = React.HTMLAttributes<HTMLElement> & {
  elevation?: 1 | 2 | 3;
};

export function Card({ elevation = 1, className = "", children, ...props }: CardProps) {
  return React.createElement("article", { ...props, className: `uiCard elevation${elevation} ${className}`.trim() }, children);
}
