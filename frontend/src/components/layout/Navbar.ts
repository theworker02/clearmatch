import React from "react";
import { Heart, MessageCircle, Search, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Tooltip } from "../ui/Tooltip";

const tabs = [
  { to: "/discover", label: "Discover", icon: Search },
  { to: "/matches", label: "Matches", icon: Heart },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/profile", label: "Profile", icon: UserRound }
];

export function Navbar() {
  return React.createElement(
    "nav",
    { className: "bottomNav", "aria-label": "Primary" },
    tabs.map((tab) =>
      React.createElement(
        Tooltip,
        { key: tab.to, text: `${tab.label === "Discover" ? "Browse compatible people with private swipes" : tab.label === "Matches" ? "Review mutual matches and compatibility" : tab.label === "Messages" ? "Open conversations unlocked by mutual matches" : "Manage how your profile appears"}`, position: "top" },
        React.createElement(
          NavLink,
          { to: tab.to, className: ({ isActive }: { isActive: boolean }) => (isActive ? "bottomNavItem active" : "bottomNavItem") },
          React.createElement(tab.icon, { size: 20 }),
          React.createElement("span", null, tab.label)
        )
      )
    )
  );
}
