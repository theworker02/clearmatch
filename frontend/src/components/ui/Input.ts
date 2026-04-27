import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, ...props }: InputProps) {
  const input = React.createElement("input", props);
  if (!label) return input;
  return React.createElement("label", null, label, input);
}
