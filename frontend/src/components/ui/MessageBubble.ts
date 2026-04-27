import React from "react";
import { Reply } from "lucide-react";
import type { Message, Profile } from "../../../../shared/types";
import { Tooltip } from "./Tooltip";

export function MessageBubble({
  message,
  mine,
  profile,
  timestamp,
  actionsOpen,
  onReply,
  onReact,
  onPointerDown,
  onPointerUp
}: {
  message: Message;
  mine: boolean;
  profile?: Profile;
  timestamp: string;
  actionsOpen?: boolean;
  onReply: () => void;
  onReact: (emoji: string) => void;
  onPointerDown: () => void;
  onPointerUp: () => void;
}) {
  const avatar = !mine && profile?.photos[0]
    ? React.createElement("img", { className: "messageAvatar", src: profile.photos[0], alt: "" })
    : React.createElement("span", { className: "messageAvatar spacer", "aria-hidden": true });

  return React.createElement(
    "div",
    {
      className: `${mine ? "messageGroup mine" : "messageGroup"} ${actionsOpen ? "actionsOpen" : ""}`,
      onPointerDown,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onPointerLeave: onPointerUp
    },
    !mine ? avatar : null,
    React.createElement(
      "p",
      { className: mine ? "bubble mine" : "bubble" },
      message.replyToMessageId ? React.createElement("span", { className: "replyStripe" }, "Replying in thread") : null,
      message.body,
      React.createElement("small", null, `${timestamp} · ${message.readAt ? "Read" : "Sent"}`)
    ),
    React.createElement(
      "div",
      { className: "messageActions" },
      React.createElement(Tooltip, { text: "Reply directly to keep context clear." }, React.createElement("button", { onClick: onReply }, React.createElement(Reply, { size: 13 }), "Reply")),
      ["❤️", "👍", "😂"].map((emoji) => React.createElement(Tooltip, { key: emoji, text: "React without interrupting the conversation flow." }, React.createElement("button", { onClick: () => onReact(emoji) }, emoji)))
    ),
    message.reactions?.length
      ? React.createElement("div", { className: "reactionRow" }, message.reactions.map((reaction) => React.createElement("span", { key: reaction.id }, reaction.emoji)))
      : null
  );
}
