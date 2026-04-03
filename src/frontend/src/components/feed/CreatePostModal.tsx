import { Image, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useCreatePost } from "../../hooks/useQueries";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ open, onClose }: Props) {
  const [content, setContent] = useState("");
  const [charCount, setCharCount] = useState(0);
  const createPost = useCreatePost();
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleContentChange = (value: string) => {
    setContent(value);
    setCharCount(value.length);
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.info("Sign in to create posts");
      login();
      return;
    }
    if (!content.trim()) {
      toast.warning("Post content cannot be empty");
      return;
    }
    try {
      await createPost.mutateAsync({ content, image: null });
      setContent("");
      setCharCount(0);
      onClose();
      toast.success("Post published!");
    } catch {
      toast.error("Failed to publish post");
    }
  };

  const handleClose = () => {
    if (!createPost.isPending) {
      setContent("");
      setCharCount(0);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={handleClose}
          data-ocid="create_post.modal"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-lg mx-4 rounded-2xl overflow-hidden"
            style={{
              background: "oklch(13% 0.025 240)",
              border: "1px solid oklch(22% 0.04 240 / 0.6)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid oklch(22% 0.04 240 / 0.5)" }}
            >
              <h2 className="text-lg font-semibold text-foreground">
                Create Post
              </h2>
              <button
                type="button"
                onClick={handleClose}
                disabled={createPost.isPending}
                data-ocid="create_post.close_button"
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              {!isAuthenticated && (
                <div
                  className="mb-4 p-3 rounded-xl text-sm text-center"
                  style={{
                    background: "oklch(16% 0.025 240)",
                    border: "1px solid oklch(30% 0.05 263 / 0.3)",
                  }}
                >
                  <p className="text-muted-foreground mb-2">
                    Sign in to publish posts
                  </p>
                  <button
                    type="button"
                    onClick={login}
                    className="gradient-btn px-4 py-1.5 rounded-lg text-sm font-semibold"
                  >
                    Sign In
                  </button>
                </div>
              )}

              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="What's on your mind? Share it with the ICP community..."
                rows={5}
                maxLength={2000}
                data-ocid="create_post.textarea"
                className="w-full resize-none text-foreground placeholder:text-muted-foreground outline-none text-sm leading-relaxed rounded-xl p-3 focus:ring-1 focus:ring-primary/50"
                style={{
                  background: "oklch(16% 0.028 240)",
                  border: "1px solid oklch(22% 0.04 240 / 0.5)",
                }}
              />

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
                    title="Add image (coming soon)"
                  >
                    <Image size={16} />
                    <span>Photo</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-mono ${
                      charCount > 1800
                        ? "text-orange-400"
                        : charCount > 1500
                          ? "text-yellow-400"
                          : "text-muted-foreground"
                    }`}
                  >
                    {charCount}/2000
                  </span>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={createPost.isPending || !content.trim()}
                    data-ocid="create_post.submit_button"
                    className="gradient-btn px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                  >
                    {createPost.isPending && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    {createPost.isPending ? "Publishing..." : "Publish"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
