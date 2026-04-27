import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ConversationMetrics, ConversationStarter, Match, MatchQualityBreakdown, Message, Profile, Report, TrustScore, User } from "../../shared/types";

const API = "/api";

type AppContext = {
  token: string;
  user: Omit<User, "passwordHash"> | null;
  profile: Profile | null;
  login: (email: string, password: string, mode: "login" | "signup") => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  api: <T>(path: string, options?: RequestInit) => Promise<T>;
};

const Context = createContext<AppContext | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState(localStorage.getItem("clearmatch.token") || "");
  const [user, setUser] = useState<Omit<User, "passwordHash"> | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  async function api<T>(path: string, options: RequestInit = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");
    return data as T;
  }

  async function login(email: string, password: string, mode: "login" | "signup") {
    const response = await fetch(`${API}/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Authentication failed");
    localStorage.setItem("clearmatch.token", data.token);
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("clearmatch.token");
    setToken("");
    setUser(null);
    setProfile(null);
  }

  async function refreshMe() {
    if (!token) return;
    const me = await api<{ user: Omit<User, "passwordHash">; profile: Profile | null }>("/me");
    setUser(me.user);
    setProfile(me.profile);
  }

  useEffect(() => {
    refreshMe().catch(() => logout());
  }, [token]);

  const value = useMemo(() => ({ token, user, profile, login, logout, refreshMe, api }), [token, user, profile]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useApp() {
  const context = useContext(Context);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}

export type DiscoverItem = { profile: Profile; explanation: import("../../shared/types").MatchExplanation; trust: TrustScore };
export type MatchListItem = { match: Match; profiles: Profile[]; metrics: ConversationMetrics; starters: ConversationStarter[]; lastMessage?: Message; unreadCount?: number };
export type LikeListItem = { like: import("../../shared/types").Like; profile: Profile };
export type AdminReport = Report & { reporter: string; reported: string };
export type ChatMessage = Message;
export type ConversationBundle = { messages: Message[]; metrics: ConversationMetrics; starters: ConversationStarter[]; quality: MatchQualityBreakdown; profiles?: Profile[] };
