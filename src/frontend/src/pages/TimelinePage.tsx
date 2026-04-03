import { Loader2, Send, Zap } from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import { toast } from "sonner";
import { SEED_STATUS_UPDATES, SEED_USERS } from "../data/seedData";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateStatusUpdate, useStatusUpdates } from "../hooks/useQueries";
import { formatRelativeTime, getInitials, parsePostText } from "../lib/helpers";

const MAX_CHARS = 280;

export default function TimelinePage() {
  const { data: updates, isLoading } = useStatusUpdates();
  const displayUpdates =
    updates && updates.length > 0 ? updates : SEED_STATUS_UPDATES;
  const createUpdate = useCreateStatusUpdate();
  const [content, setContent] = useState("");
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const handlePost = async () => {
    if (!isAuthenticated) {
      toast.info("Sign in to post status updates");
      return;
    }
    if (!content.trim()) return;
    try {
      await createUpdate.mutateAsync(content);
      setContent("");
      toast.success("Status posted!");
    } catch {
      toast.error("Failed to post status update");
    }
  };

  const remaining = MAX_CHARS - content.length;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Zap size={22} className="text-primary" />
          Timeline
        </h1>

        {/* Compose box */}
        <div
          className="card-surface p-4 mb-5"
          data-ocid="timeline.compose.card"
        >
          <div className="flex gap-3">
            <div
              className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
              }}
            >
              U
            </div>
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
                placeholder="What's happening on ICP today?"
                rows={3}
                data-ocid="timeline.compose.textarea"
                className="w-full resize-none text-sm text-foreground placeholder:text-muted-foreground outline-none leading-relaxed p-0 bg-transparent"
              />
              <div
                className="flex items-center justify-between pt-3 mt-2"
                style={{ borderTop: "1px solid oklch(22% 0.04 240 / 0.4)" }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-mono ${
                      remaining < 20
                        ? "text-orange-400"
                        : remaining < 50
                          ? "text-yellow-400"
                          : "text-muted-foreground"
                    }`}
                  >
                    {remaining}
                  </span>
                  {remaining < 50 && (
                    <div
                      className="w-5 h-5 rounded-full border-2"
                      style={{
                        borderColor: remaining < 20 ? "#f97316" : "#eab308",
                        background: `conic-gradient(${remaining < 20 ? "#f97316" : "#eab308"} ${((MAX_CHARS - remaining) / MAX_CHARS) * 360}deg, transparent 0deg)`,
                      }}
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={handlePost}
                  disabled={
                    createUpdate.isPending ||
                    !content.trim() ||
                    !isAuthenticated
                  }
                  data-ocid="timeline.compose.submit_button"
                  className="gradient-btn px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {createUpdate.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  {createUpdate.isPending ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline posts */}
        <div className="space-y-3" data-ocid="timeline.list">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`timeline-skeleton-${i}`}
                className="card-surface p-4 animate-pulse"
              >
                <div
                  className="h-4 rounded w-3/4 mb-2"
                  style={{ background: "oklch(20% 0.03 240)" }}
                />
                <div
                  className="h-3 rounded w-1/2"
                  style={{ background: "oklch(18% 0.03 240)" }}
                />
              </div>
            ))
          ) : displayUpdates.length === 0 ? (
            <div
              className="card-surface p-12 text-center"
              data-ocid="timeline.empty_state"
            >
              <p className="text-muted-foreground text-sm">
                No status updates yet
              </p>
            </div>
          ) : (
            displayUpdates.map((update, idx) => {
              const user = SEED_USERS.find(
                (u) => u.principalId.toString() === update.author.toString(),
              );
              const parts = parsePostText(update.content);
              return (
                <motion.div
                  key={update.id.toString()}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="card-surface p-4 flex gap-3"
                  data-ocid={`timeline.item.${idx + 1}`}
                >
                  <div
                    className="story-ring flex-shrink-0"
                    style={{ width: 42, height: 42 }}
                  >
                    <div className="story-ring-inner w-full h-full">
                      <div
                        className="w-full h-full rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{
                          background: `hsl(${(idx * 70 + 180) % 360}, 60%, 35%)`,
                        }}
                      >
                        {user ? getInitials(user.displayName) : "U"}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground">
                        {user?.displayName ?? "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        @{user?.username}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        · {formatRelativeTime(update.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 mt-1 leading-relaxed">
                      {parts.map((part, partIdx) =>
                        part.type !== "text" ? (
                          <span
                            key={`tag-${update.id}-${partIdx}`}
                            style={{ color: "#60A5FA" }}
                          >
                            {part.value}
                          </span>
                        ) : (
                          <span key={`txt-${update.id}-${partIdx}`}>
                            {part.value}
                          </span>
                        ),
                      )}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}
