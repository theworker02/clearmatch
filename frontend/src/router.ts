import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export type RouteComponent = ComponentType | LazyExoticComponent<ComponentType>;

export type RouteDefinition = {
  path: string;
  component?: RouteComponent;
  redirectTo?: string;
  protected: boolean;
};

const Home = lazy(() => import("./pages/Home").then((module) => ({ default: module.Home })));
const Login = lazy(() => import("./pages/Login").then((module) => ({ default: module.Login })));
const Signup = lazy(() => import("./pages/Signup").then((module) => ({ default: module.Signup })));
const PersonalityTest = lazy(() => import("./pages/PersonalityTest").then((module) => ({ default: module.PersonalityTest })));
const SetupProfile = lazy(() => import("./pages/SetupProfile").then((module) => ({ default: module.SetupProfile })));
const Discover = lazy(() => import("./pages/Discover").then((module) => ({ default: module.Discover })));
const Matches = lazy(() => import("./pages/Matches").then((module) => ({ default: module.Matches })));
const Messages = lazy(() => import("./pages/Messages").then((module) => ({ default: module.Messages })));
const Chat = lazy(() => import("./pages/Chat").then((module) => ({ default: module.Chat })));
const Profile = lazy(() => import("./pages/Profile").then((module) => ({ default: module.Profile })));
const Settings = lazy(() => import("./pages/Settings").then((module) => ({ default: module.Settings })));
const Privacy = lazy(() => import("./pages/Privacy").then((module) => ({ default: module.Privacy })));
const Reports = lazy(() => import("./pages/Reports").then((module) => ({ default: module.Reports })));
const Admin = lazy(() => import("./pages/Admin").then((module) => ({ default: module.Admin })));
const LikesReceived = lazy(() => import("./views/LikesReceived").then((module) => ({ default: module.LikesReceived })));
const Compliments = lazy(() => import("./views/Compliments").then((module) => ({ default: module.Compliments })));
const MatchQualityDashboard = lazy(() => import("./views/MatchQualityDashboard").then((module) => ({ default: module.MatchQualityDashboard })));
const MatchDetails = lazy(() => import("./views/MatchDetails").then((module) => ({ default: module.MatchDetails })));

export const routes: RouteDefinition[] = [
  { path: "/", component: Home, protected: false },
  { path: "/login", component: Login, protected: false },
  { path: "/signup", component: Signup, protected: false },
  { path: "/auth", redirectTo: "/login", protected: false },
  { path: "/personality-test", component: PersonalityTest, protected: true },
  { path: "/personality", redirectTo: "/personality-test", protected: true },
  { path: "/setup-profile", component: SetupProfile, protected: true },
  { path: "/setup", redirectTo: "/setup-profile", protected: true },
  { path: "/discover", component: Discover, protected: true },
  { path: "/matches", component: Matches, protected: true },
  { path: "/messages", component: Messages, protected: true },
  { path: "/chat/:matchId", component: Chat, protected: true },
  { path: "/profile", component: Profile, protected: true },
  { path: "/settings", component: Settings, protected: true },
  { path: "/privacy", component: Privacy, protected: true },
  { path: "/safety", redirectTo: "/privacy", protected: true },
  { path: "/reports", component: Reports, protected: true },
  { path: "/admin", component: Admin, protected: true },
  { path: "/admin/reports", redirectTo: "/admin", protected: true },
  { path: "/likes", component: LikesReceived, protected: true },
  { path: "/compliments", component: Compliments, protected: true },
  { path: "/dashboard", component: MatchQualityDashboard, protected: true },
  { path: "/match/:profileId", component: MatchDetails, protected: true }
];
