import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Bell, ChevronDown, Mail, Search } from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { useState } from "react";
import { SEED_NOTIFICATIONS } from "../../data/seedData";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useCallerProfile,
  useIsAdmin,
  useNotifications,
} from "../../hooks/useQueries";
import { getInitials } from "../../lib/helpers";
import CreatePostModal from "../feed/CreatePostModal";
import BottomNav from "./BottomNav";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

const CONTENT_LEFT_OFFSET = "240px";
const CONTENT_RIGHT_OFFSET = "288px";

export default function AppLayout() {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: notifications } = useNotifications();
  const displayNotifications = notifications ?? SEED_NOTIFICATIONS;
  const unreadCount = displayNotifications.filter((n) => !n.isRead).length;
  const { data: isAdmin } = useIsAdmin();
  const { data: callerProfile } = useCallerProfile();
  // location used implicitly via Link active state
  useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/explore?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Left Sidebar */}
      <LeftSidebar
        onCreatePost={() => setShowCreatePost(true)}
        isAdmin={isAdmin}
      />

      {/* Main Content */}
      <main
        className="flex-1 min-h-screen"
        style={{
          marginLeft: "var(--sidebar-left, 0)",
          marginRight: "var(--sidebar-right, 0)",
          paddingBottom: "72px",
        }}
      >
        {/* Top Bar */}
        <header
          className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3"
          style={{
            background: "oklch(13% 0.028 240 / 0.95)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid oklch(22% 0.04 240 / 0.4)",
          }}
        >
          {/* Mobile brand */}
          <Link to="/" className="lg:hidden flex items-center gap-2 mr-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
              }}
            >
              <span className="text-white text-xs font-bold">S</span>
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search profiles, posts, groups"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-ocid="header.search_input"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50"
                style={{
                  background: "oklch(16% 0.028 240)",
                  border: "1px solid oklch(22% 0.04 240 / 0.5)",
                }}
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            <Link
              to="/notifications"
              data-ocid="header.notifications.button"
              className="relative w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
              style={{ background: "oklch(16% 0.028 240)" }}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                  style={{
                    background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            <Link
              to="/messages"
              data-ocid="header.messages.button"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
              style={{ background: "oklch(16% 0.028 240)" }}
            >
              <Mail size={18} />
            </Link>

            {isAuthenticated ? (
              <Link
                to="/profile"
                className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-accent/50 transition-all"
                style={{ background: "oklch(16% 0.028 240)" }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                  }}
                >
                  {callerProfile?.displayName
                    ? getInitials(callerProfile.displayName)
                    : "U"}
                </div>
                <span className="hidden sm:block text-sm font-medium text-foreground max-w-[80px] truncate">
                  {callerProfile?.displayName ?? "Profile"}
                </span>
                <ChevronDown size={14} className="text-muted-foreground" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={login}
                disabled={isLoggingIn}
                data-ocid="header.login.button"
                className="gradient-btn px-4 py-2 rounded-xl text-sm font-semibold"
              >
                {isLoggingIn ? "Signing in..." : "Sign In"}
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="lg:px-6 px-2 py-4">
          <Outlet />
        </div>
      </main>

      {/* Right Sidebar */}
      <RightSidebar />

      {/* Mobile Bottom Nav */}
      <BottomNav onCreatePost={() => setShowCreatePost(true)} />

      {/* Create Post Modal */}
      <CreatePostModal
        open={showCreatePost}
        onClose={() => setShowCreatePost(false)}
      />

      {/* Sidebar CSS for layout spacing */}
      <style>{`
        @media (min-width: 1024px) {
          :root { --sidebar-left: ${CONTENT_LEFT_OFFSET}; }
          main { margin-left: ${CONTENT_LEFT_OFFSET}; }
        }
        @media (min-width: 1280px) {
          :root { --sidebar-right: ${CONTENT_RIGHT_OFFSET}; }
          main { margin-right: ${CONTENT_RIGHT_OFFSET}; }
        }
      `}</style>
    </div>
  );
}
