import { Link, useLocation } from "@tanstack/react-router";
import {
  Bell,
  Compass,
  Home,
  LogIn,
  LogOut,
  MessageCircle,
  PlusCircle,
  Shield,
  User,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import { SEED_NOTIFICATIONS } from "../../data/seedData";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useNotifications } from "../../hooks/useQueries";

const NAV_ITEMS = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/explore", icon: Compass, label: "Explore" },
  { to: "/timeline", icon: Zap, label: "Timeline" },
  { to: "/messages", icon: MessageCircle, label: "Messages" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/profile", icon: User, label: "Profile" },
] as const;

interface Props {
  onCreatePost: () => void;
  isAdmin?: boolean;
}

export default function LeftSidebar({ onCreatePost, isAdmin }: Props) {
  const location = useLocation();
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: notifications } = useNotifications();
  const displayNotifications = notifications ?? SEED_NOTIFICATIONS;
  const unreadCount = displayNotifications.filter((n) => !n.isRead).length;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="hidden lg:flex flex-col fixed left-0 top-0 h-full z-30"
      style={{
        width: collapsed ? "72px" : "240px",
        background: "oklch(11% 0.028 240)",
        borderRight: "1px solid oklch(22% 0.04 240 / 0.5)",
        transition: "width 0.2s ease",
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border/50">
        <div
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #3B82F6, #8B5CF6)" }}
        >
          <Zap size={18} className="text-white" />
        </div>
        {!collapsed && (
          <span className="text-xl font-bold">
            <span className="text-foreground">Social</span>
            <span className="gradient-text">ICP</span>
          </span>
        )}
        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M11 8L6 3M6 13l5-5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </button>
        )}
        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            className="text-muted-foreground hover:text-foreground"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M5 8l5-5M5 13l5-5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Create Post Button */}
      <div className={`px-3 py-4 ${collapsed ? "flex justify-center" : ""}`}>
        <button
          type="button"
          onClick={onCreatePost}
          data-ocid="create_post.open_modal_button"
          className={`gradient-btn rounded-xl flex items-center gap-2 transition-all ${
            collapsed ? "w-10 h-10 justify-center" : "w-full px-4 py-2.5"
          }`}
        >
          <PlusCircle size={18} className="flex-shrink-0" />
          {!collapsed && (
            <span className="font-semibold text-sm">Create Post</span>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.to;
          const showBadge = item.to === "/notifications" && unreadCount > 0;
          return (
            <Link
              key={item.to}
              to={item.to}
              data-ocid={`nav.${item.label.toLowerCase()}.link`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <div className="relative flex-shrink-0">
                <item.icon size={20} />
                {showBadge && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                    style={{
                      background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                    }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              {!collapsed && (
                <span
                  className={`text-sm font-medium ${
                    isActive ? "gradient-text" : ""
                  }`}
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}

        {isAdmin && !collapsed && (
          <Link
            to="/admin"
            data-ocid="nav.admin.link"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              location.pathname === "/admin"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            <Shield size={20} />
            <span className="text-sm font-medium">Admin</span>
          </Link>
        )}
      </nav>

      {/* Footer: auth */}
      <div className="p-3 border-t border-border/50 space-y-1">
        {isAuthenticated ? (
          <button
            type="button"
            onClick={clear}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut size={20} />
            {!collapsed && (
              <span className="text-sm font-medium">Sign Out</span>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={login}
            disabled={isLoggingIn}
            data-ocid="auth.login.button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-primary hover:bg-primary/10 transition-all"
          >
            <LogIn size={20} />
            {!collapsed && (
              <span className="text-sm font-medium">
                {isLoggingIn ? "Signing in..." : "Sign In"}
              </span>
            )}
          </button>
        )}
      </div>
    </motion.aside>
  );
}
