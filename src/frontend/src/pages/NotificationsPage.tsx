import {
  Bell,
  BellOff,
  Heart,
  Loader2,
  MessageCircle,
  UserPlus,
} from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { toast } from "sonner";
import { SEED_NOTIFICATIONS } from "../data/seedData";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useMarkNotificationsRead,
  useNotifications,
} from "../hooks/useQueries";
import { formatRelativeTime } from "../lib/helpers";

function getNotificationIcon(message: string) {
  if (
    message.toLowerCase().includes("liked") ||
    message.toLowerCase().includes("like")
  ) {
    return <Heart size={16} className="text-pink-400" />;
  }
  if (
    message.toLowerCase().includes("following") ||
    message.toLowerCase().includes("follow")
  ) {
    return <UserPlus size={16} className="text-primary" />;
  }
  if (
    message.toLowerCase().includes("comment") ||
    message.toLowerCase().includes("message")
  ) {
    return <MessageCircle size={16} className="text-green-400" />;
  }
  return <Bell size={16} className="text-muted-foreground" />;
}

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const displayNotifications =
    notifications && notifications.length > 0
      ? notifications
      : SEED_NOTIFICATIONS;
  const unread = displayNotifications.filter((n) => !n.isRead);
  const markRead = useMarkNotificationsRead();

  const handleMarkAllRead = async () => {
    if (!isAuthenticated) {
      toast.info("Sign in to manage notifications");
      return;
    }
    try {
      await markRead.mutateAsync();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bell size={22} className="text-primary" />
          Notifications
          {unread.length > 0 && (
            <span
              className="ml-1 text-sm px-2 py-0.5 rounded-full font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
              }}
            >
              {unread.length}
            </span>
          )}
        </h1>

        {unread.length > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={markRead.isPending}
            data-ocid="notifications.mark_read.button"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-all"
            style={{
              background: "oklch(14% 0.025 240)",
              border: "1px solid oklch(22% 0.04 240 / 0.4)",
            }}
          >
            {markRead.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <BellOff size={14} />
            )}
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2" data-ocid="notifications.list">
        {isLoading ? (
          [1, 2, 3, 4].map((n) => (
            <div
              key={`notification-skeleton-${n}`}
              className="card-surface p-4 flex gap-3 animate-pulse"
              data-ocid="notifications.loading_state"
            >
              <div
                className="w-10 h-10 rounded-full"
                style={{ background: "oklch(20% 0.03 240)" }}
              />
              <div className="flex-1 space-y-2">
                <div
                  className="h-3 rounded w-3/4"
                  style={{ background: "oklch(20% 0.03 240)" }}
                />
                <div
                  className="h-2 rounded w-1/2"
                  style={{ background: "oklch(18% 0.03 240)" }}
                />
              </div>
            </div>
          ))
        ) : displayNotifications.length === 0 ? (
          <div
            className="card-surface p-12 text-center"
            data-ocid="notifications.empty_state"
          >
            <BellOff size={40} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              No notifications yet
            </p>
          </div>
        ) : (
          displayNotifications.map((notification, idx) => (
            <motion.div
              key={notification.id.toString()}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`card-surface p-4 flex items-center gap-3 transition-all ${
                !notification.isRead ? "border-primary/20" : ""
              }`}
              style={{
                borderLeft: !notification.isRead
                  ? "3px solid #3B82F6"
                  : undefined,
              }}
              data-ocid={`notifications.item.${idx + 1}`}
            >
              <div
                className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ background: "oklch(16% 0.028 240)" }}
              >
                {getNotificationIcon(notification.message)}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm ${!notification.isRead ? "text-foreground font-medium" : "text-foreground/80"}`}
                >
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatRelativeTime(notification.timestamp)}
                </p>
              </div>
              {!notification.isRead && (
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: "#3B82F6" }}
                />
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
