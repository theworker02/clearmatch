import React, { cloneElement, isValidElement, useEffect, useRef, useState } from "react";

type TooltipProps = {
  text: string;
  children?: React.ReactElement;
  position?: "top" | "bottom" | "left" | "right";
};

export function Tooltip({ text, children, position = "top" }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | null>(null);

  function show() {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), 300);
  }

  function hide() {
    if (timer.current) window.clearTimeout(timer.current);
    setOpen(false);
  }

  const childProps = isValidElement(children) ? children.props as Record<string, unknown> : {};
  const trigger = isValidElement(children)
    ? cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        onMouseEnter: (event: React.MouseEvent) => {
          (childProps.onMouseEnter as ((event: React.MouseEvent) => void) | undefined)?.(event);
          show();
        },
        onMouseLeave: (event: React.MouseEvent) => {
          (childProps.onMouseLeave as ((event: React.MouseEvent) => void) | undefined)?.(event);
          hide();
        },
        onFocus: (event: React.FocusEvent) => {
          (childProps.onFocus as ((event: React.FocusEvent) => void) | undefined)?.(event);
          show();
        },
        onBlur: (event: React.FocusEvent) => {
          (childProps.onBlur as ((event: React.FocusEvent) => void) | undefined)?.(event);
          hide();
        },
        onTouchStart: (event: React.TouchEvent) => {
          (childProps.onTouchStart as ((event: React.TouchEvent) => void) | undefined)?.(event);
          show();
        },
        onTouchEnd: (event: React.TouchEvent) => {
          (childProps.onTouchEnd as ((event: React.TouchEvent) => void) | undefined)?.(event);
          hide();
        },
        "aria-describedby": open ? `tooltip-${text.replace(/\W+/g, "-").toLowerCase()}` : childProps["aria-describedby"]
      })
    : null;

  return React.createElement(
    "span",
    { className: `tooltipWrap ${open ? "open" : ""} ${position}` },
    trigger,
    React.createElement("span", { id: `tooltip-${text.replace(/\W+/g, "-").toLowerCase()}`, role: "tooltip", className: "tooltipBubble" }, text)
  );
}

const tooltipHints: Record<string, string> = {
  "open setup": "Complete your profile before matching becomes available.",
  "send message": "Open the private chat unlocked by this mutual match.",
  "keep browsing": "Close this match moment and return to discovery.",
  "like back": "Return interest privately and unlock chat if it is mutual.",
  "clear": "Remove the reply reference before sending.",
  "log in": "Access your private ClearMatch account.",
  "sign up": "Create an age-gated private dating account.",
  "send compliment": "Send one thoughtful note before matching.",
  "accept": "Accept this compliment and keep the interaction open.",
  "ignore": "Dismiss this compliment without notifying publicly.",
  "report": "Send this interaction to moderation for review.",
  "preview warning": "Preview the safety reminder shown on sensitive screens.",
  "hide profile": "Pause discovery visibility while keeping matches intact.",
  "block demo user": "Block contact from this demo profile.",
  "submit report": "Create a moderation report for this concern.",
  "validate photos": "Check upload rules before adding profile photos.",
  "save profile": "Save profile answers used for match quality.",
  "emergency safety tips": "Show practical safety guidance for meeting and messaging."
};

function hintFor(element: HTMLElement) {
  const label = (element.getAttribute("aria-label") || element.textContent || "").trim().toLowerCase();
  if (!label) return "";
  return tooltipHints[label] || `${label.replace(/^\w/, (letter) => letter.toUpperCase())}: this action stays private inside ClearMatch.`;
}

export function GlobalTooltips() {
  useEffect(() => {
    let pressTimer: number | null = null;
    const apply = () => {
      document.querySelectorAll<HTMLElement>("button, a, input, select, textarea, .badge").forEach((element) => {
        if (element.closest(".tooltipWrap") || element.dataset.tooltip) return;
        const hint = hintFor(element);
        if (hint) element.dataset.tooltip = hint;
      });
    };
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    apply();

    const showTouch = (event: TouchEvent) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>("[data-tooltip]");
      if (!target) return;
      pressTimer = window.setTimeout(() => target.classList.add("tooltipTouchOpen"), 300);
    };
    const hideTouch = () => {
      if (pressTimer) window.clearTimeout(pressTimer);
      document.querySelectorAll(".tooltipTouchOpen").forEach((element) => element.classList.remove("tooltipTouchOpen"));
    };
    document.addEventListener("touchstart", showTouch, { passive: true });
    document.addEventListener("touchend", hideTouch);
    document.addEventListener("touchcancel", hideTouch);
    return () => {
      observer.disconnect();
      document.removeEventListener("touchstart", showTouch);
      document.removeEventListener("touchend", hideTouch);
      document.removeEventListener("touchcancel", hideTouch);
    };
  }, []);

  return null;
}
