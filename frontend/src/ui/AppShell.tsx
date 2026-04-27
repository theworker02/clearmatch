import { BarChart3, Heart, MessageCircle, Search, Settings, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { Tooltip } from "../components/ui/Tooltip";
import { useApp } from "../state";

const nav = [
  { to: "/discover", label: "Discover", icon: Search },
  { to: "/likes", label: "Likes", icon: Heart },
  { to: "/matches", label: "Matches", icon: Heart },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/compliments", label: "Compliments", icon: Sparkles },
  { to: "/dashboard", label: "Quality", icon: BarChart3 },
  { to: "/privacy", label: "Privacy", icon: ShieldCheck },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { profile, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="appFrame">
      <aside className="sideNav">
        <Tooltip text="Return to private discovery without social feed activity" position="right">
          <button className="brandButton" onClick={() => navigate("/discover")}>
            <img className="brandMark" src="/clearmatch-mark.svg" alt="" />
            <span>ClearMatch</span>
          </button>
        </Tooltip>
        <nav>
          {nav.map((item) => (
            <Tooltip key={item.to} text={`${item.label}: ${item.label === "Quality" ? "See match and reply insights" : item.label === "Privacy" ? "Control safety and visibility" : "Open this ClearMatch section"}`} position="right">
              <NavLink to={item.to} className={({ isActive }) => (isActive ? "navItem active" : "navItem")}>
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            </Tooltip>
          ))}
        </nav>
        <Tooltip text="Review your public dating profile and trust badges" position="right">
          <button className="profileMini" onClick={() => navigate("/profile")}>
            <UserRound size={18} />
            <span>{profile?.displayName || "Profile"}</span>
          </button>
        </Tooltip>
        <Tooltip text="End this private session on this device" position="right">
          <button className="ghostButton" onClick={() => { logout(); navigate("/login"); }}>Log out</button>
        </Tooltip>
      </aside>
      <main className="content">
        <div className="routeTransition" key={location.pathname}>
          {children}
        </div>
      </main>
      <Navbar />
    </div>
  );
}
