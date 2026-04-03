import { Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";
import { toast } from "sonner";
import type { Story } from "../../backend.d";
import { SEED_STORIES, SEED_USERS } from "../../data/seedData";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useActiveStories, useCreateStory } from "../../hooks/useQueries";
import { formatRelativeTime, getInitials } from "../../lib/helpers";

const AVATAR_IMGS: Record<string, string> = {
  "rdmx6-jaaaa-aaaaa-aaadq-cai": "/assets/generated/avatar-1.dim_200x200.jpg",
  "rrkah-fqaaa-aaaaa-aaaaq-cai": "/assets/generated/avatar-2.dim_200x200.jpg",
};

function getUserForStory(authorPrincipal: string) {
  return SEED_USERS.find((u) => u.principalId.toString() === authorPrincipal);
}

interface StoryViewerProps {
  story: Story;
  onClose: () => void;
}

function StoryViewer({ story, onClose }: StoryViewerProps) {
  const user = getUserForStory(story.author.toString());
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.9)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-sm mx-4 rounded-2xl overflow-hidden relative"
          style={{
            background:
              "linear-gradient(135deg, oklch(15% 0.04 250), oklch(20% 0.05 280))",
            border: "1px solid oklch(30% 0.06 260 / 0.5)",
            minHeight: "400px",
          }}
          onClick={(e) => e.stopPropagation()}
          data-ocid="story.modal"
        >
          {/* Progress bar */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: "oklch(25% 0.04 240)" }}
          >
            <motion.div
              className="h-full"
              style={{ background: "linear-gradient(90deg, #3B82F6, #8B5CF6)" }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 5, ease: "linear" }}
              onAnimationComplete={onClose}
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "oklch(25% 0.04 240)" }}
            data-ocid="story.close_button"
          >
            <X size={16} className="text-foreground" />
          </button>

          <div className="p-6 pt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="story-ring" style={{ width: 44, height: 44 }}>
                <div className="story-ring-inner w-full h-full">
                  {AVATAR_IMGS[story.author.toString()] ? (
                    <img
                      src={AVATAR_IMGS[story.author.toString()]}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{
                        background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                      }}
                    >
                      {user ? getInitials(user.displayName) : "U"}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {user?.displayName ?? "Unknown"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatRelativeTime(story.timestamp)}
                </p>
              </div>
            </div>
            <p className="text-lg text-foreground leading-relaxed">
              {story.content}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function StoryBar() {
  const { data: stories } = useActiveStories();
  const displayStories = stories && stories.length > 0 ? stories : SEED_STORIES;
  const [viewingStory, setViewingStory] = useState<Story | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newStoryText, setNewStoryText] = useState("");
  const createStory = useCreateStory();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const handleCreateStory = async () => {
    if (!newStoryText.trim()) return;
    try {
      await createStory.mutateAsync(newStoryText);
      setNewStoryText("");
      setShowCreate(false);
      toast.success("Story posted!");
    } catch {
      toast.error("Failed to post story");
    }
  };

  return (
    <>
      <div
        className="flex items-start gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Add story button */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
          >
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              data-ocid="story.add.button"
              className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-dashed transition-all hover:border-primary"
              style={{
                borderColor: "oklch(30% 0.04 240)",
                background: "oklch(14% 0.025 240)",
              }}
            >
              <Plus size={24} className="text-muted-foreground" />
            </button>
            <span className="text-xs text-muted-foreground">Add Story</span>
          </motion.div>
        )}

        {/* Stories */}
        {displayStories.map((story, idx) => {
          const user = getUserForStory(story.author.toString());
          const avatarImg = AVATAR_IMGS[story.author.toString()];
          return (
            <motion.button
              type="button"
              key={story.id.toString()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer bg-transparent border-none p-0"
              onClick={() => setViewingStory(story)}
              data-ocid={`story.item.${idx + 1}`}
            >
              <div className="story-ring" style={{ width: 64, height: 64 }}>
                <div className="story-ring-inner w-full h-full">
                  {avatarImg ? (
                    <img
                      src={avatarImg}
                      alt={user?.displayName ?? ""}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center text-base font-bold text-white"
                      style={{
                        background: `hsl(${(idx * 60 + 180) % 360}, 70%, 35%)`,
                      }}
                    >
                      {user ? getInitials(user.displayName) : "?"}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-xs text-muted-foreground max-w-[64px] truncate text-center">
                {user?.displayName.split(" ")[0] ?? "User"}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Story viewer */}
      {viewingStory && (
        <StoryViewer
          story={viewingStory}
          onClose={() => setViewingStory(null)}
        />
      )}

      {/* Create story dialog */}
      {showCreate && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowCreate(false)}
          onKeyDown={(e) => e.key === "Escape" && setShowCreate(false)}
          data-ocid="story.dialog"
        >
          <div
            className="w-full max-w-sm mx-4 rounded-2xl p-6"
            style={{
              background: "oklch(14% 0.025 240)",
              border: "1px solid oklch(22% 0.04 240 / 0.5)",
            }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Create Story
            </h3>
            <textarea
              value={newStoryText}
              onChange={(e) => setNewStoryText(e.target.value)}
              placeholder="What's your story?"
              maxLength={500}
              rows={4}
              data-ocid="story.textarea"
              className="w-full rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:ring-1 focus:ring-primary/50"
              style={{
                background: "oklch(17% 0.028 240)",
                border: "1px solid oklch(25% 0.04 240 / 0.5)",
              }}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                data-ocid="story.cancel_button"
                className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-all"
                style={{ background: "oklch(18% 0.028 240)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateStory}
                disabled={createStory.isPending || !newStoryText.trim()}
                data-ocid="story.submit_button"
                className="gradient-btn px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                {createStory.isPending ? "Posting..." : "Post Story"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
