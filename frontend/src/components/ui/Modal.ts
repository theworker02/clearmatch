import React from "react";

type ModalProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

export function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) return null;
  return React.createElement(
    "div",
    { className: "modalBackdrop", role: "presentation", onClick: onClose },
    React.createElement(
      "section",
      { className: "modalPanel elevation3", role: "dialog", "aria-modal": true, "aria-label": title, onClick: (event: React.MouseEvent) => event.stopPropagation() },
      React.createElement("header", { className: "modalHeader" }, React.createElement("h2", null, title), React.createElement(Button, { variant: "ghost", onClick: onClose }, "Close")),
      children
    )
  );
}

function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) {
  return React.createElement("button", { ...props, className: "ghostButton" }, props.children);
}
