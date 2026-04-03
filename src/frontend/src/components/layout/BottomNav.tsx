import { Link, useLocation } from "@tanstack/react-router";
import { Compass, Home, MessageCircle, PlusSquare, User } from "lucide-react";
import React from "react";

const BOTTOM_ITEMS = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/explore", icon: Compass, label: "Explore" },
  { to: "/create", icon: PlusSquare, label: "Post", isAction: true },
  { to: "/messages", icon: MessageCircle, label: "Messages" },
  { to: "/profile", icon: User, label: "Profile" },
];

interface Props {
  onCreatePost: () => void;
}

export default function BottomNav({ onCreatePost }: Props) {
  const location = useLocation();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2"
      style={{
        background: "oklch(11% 0.028 240)",
        borderTop: "1px solid oklch(22% 0.04 240 / 0.5)",
        height: "60px",
        paddingBottom: "env(safe-area-inset-bottom, 0)",
      }}
    >
      {BOTTOM_ITEMS.map((item) => {
        if (item.isAction) {
          return (
            <button
              type="button"
              key="create"
              onClick={onCreatePost}
              data-ocid="bottom_nav.post.button"
              className="flex flex-col items-center justify-center gap-0.5"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                }}
              >
                <item.icon size={20} className="text-white" />
              </div>
            </button>
          );
        }
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            data-ocid={`bottom_nav.${item.label.toLowerCase()}.link`}
            className="flex flex-col items-center justify-center gap-0.5 min-w-[44px]"
          >
            <item.icon
              size={22}
              className={isActive ? "text-primary" : "text-muted-foreground"}
            />
            <span
              className={`text-[10px] font-medium ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
