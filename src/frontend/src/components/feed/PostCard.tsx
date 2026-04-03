import { Skeleton } from "@/components/ui/skeleton";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";
import { toast } from "sonner";
import type { Post } from "../../backend.d";
import { SEED_USERS } from "../../data/seedData";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useCommentPost, useLikePost } from "../../hooks/useQueries";
import {
  formatRelativeTime,
  getInitials,
  parsePostText,
} from "../../lib/helpers";

const AVATAR_IMGS: Record<string, string> = {
  "rdmx6-jaaaa-aaaaa-aaadq-cai": "/assets/generated/avatar-1.dim_200x200.jpg",
  "rrkah-fqaaa-aaaaa-aaaaq-cai": "/assets/generated/avatar-2.dim_200x200.jpg",
};

function getUserForPost(authorPrincipal: string) {
  return SEED_USERS.find((u) => u.principalId.toString() === authorPrincipal);
}

function PostContent({ text }: { text: string }) {
  const parts = parsePostText(text);
  return (
    <p className="text-sm leading-relaxed text-foreground/90">
      {parts.map((part, i) =>
        part.type === "hashtag" || part.type === "mention" ? (
          <span key={`tag-${i}`} className="hashtag">
            {part.value}
          </span>
        ) : (
          <span key={`txt-${i}`}>{part.value}</span>
        ),
      )}
    </p>
  );
}

export function PostCardSkeleton() {
  return (
    <div
      className="card-surface p-4 space-y-3"
      data-ocid="feed.post.loading_state"
    >
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="w-32 h-3" />
          <Skeleton className="w-20 h-2" />
        </div>
      </div>
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-full h-40 rounded-lg" />
    </div>
  );
}

interface Props {
  post: Post;
  index: number;
}

export default function PostCard({ post, index }: Props) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const user = getUserForPost(post.author.toString());
  const avatarImg = AVATAR_IMGS[post.author.toString()];
  const likePost = useLikePost();
  const commentPost = useCommentPost();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.info("Sign in to like posts");
      return;
    }
    likePost.mutate(post.id, {
      onError: () => toast.error("Failed to like post"),
    });
  };

  const handleComment = async () => {
    if (!isAuthenticated) {
      toast.info("Sign in to comment");
      return;
    }
    if (!commentText.trim()) return;
    try {
      await commentPost.mutateAsync({ postId: post.id, text: commentText });
      setCommentText("");
      toast.success("Comment posted!");
    } catch {
      toast.error("Failed to post comment");
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className="card-surface overflow-hidden"
      data-ocid={`feed.post.item.${index + 1}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <div
            className="story-ring flex-shrink-0"
            style={{ width: 42, height: 42 }}
          >
            <div className="story-ring-inner w-full h-full">
              {avatarImg ? (
                <img
                  src={avatarImg}
                  alt={user?.displayName ?? ""}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{
                    background: `hsl(${(Number(post.id) * 50 + 180) % 360}, 60%, 35%)`,
                  }}
                >
                  {user ? getInitials(user.displayName) : "U"}
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">
              {user?.displayName ?? "Unknown User"}
            </p>
            <p className="text-xs text-muted-foreground">
              @{user?.username ?? "unknown"} ·{" "}
              {formatRelativeTime(post.timestamp)}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <PostContent text={post.content} />
      </div>

      {/* Image */}
      {post.id === 2n && (
        <div className="px-4 pb-3">
          <img
            src="/assets/generated/post-photo-1.dim_800x500.jpg"
            alt=""
            className="w-full rounded-xl object-cover max-h-72"
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleLike}
            data-ocid={`feed.post.like.${index + 1}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-pink-400 hover:bg-pink-500/10 transition-all text-sm"
          >
            <Heart
              size={16}
              className={
                likePost.isPending ? "fill-pink-400 text-pink-400" : ""
              }
            />
            <span>{post.likes.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            data-ocid={`feed.post.comment.${index + 1}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all text-sm"
          >
            <MessageCircle size={16} />
            <span>{post.comments.length}</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-muted-foreground hover:text-green-400 hover:bg-green-500/10 transition-all text-sm"
          >
            <Share2 size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`p-2 rounded-xl transition-all ${
            isBookmarked
              ? "text-primary"
              : "text-muted-foreground hover:text-primary hover:bg-primary/10"
          }`}
        >
          <Bookmark size={16} className={isBookmarked ? "fill-current" : ""} />
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-4 pt-2 border-t space-y-3"
              style={{ borderColor: "oklch(22% 0.04 240 / 0.5)" }}
            >
              {/* Existing comments */}
              {post.comments.map((comment) => {
                const commenter = getUserForPost(comment.commenter.toString());
                return (
                  <div key={comment.id.toString()} className="flex gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                      style={{
                        background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                      }}
                    >
                      {commenter ? getInitials(commenter.displayName) : "U"}
                    </div>
                    <div className="flex-1">
                      <div
                        className="rounded-xl px-3 py-2"
                        style={{ background: "oklch(16% 0.028 240)" }}
                      >
                        <span className="text-xs font-semibold text-foreground">
                          {commenter?.displayName ?? "User"}{" "}
                        </span>
                        <span className="text-xs text-foreground/80">
                          {comment.text}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 px-1">
                        {formatRelativeTime(comment.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Add comment input */}
              <div className="flex gap-2 items-center mt-2">
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                  }}
                >
                  You
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleComment()}
                    placeholder="Add a comment..."
                    data-ocid={`feed.post.comment_input.${index + 1}`}
                    className="flex-1 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50"
                    style={{
                      background: "oklch(16% 0.028 240)",
                      border: "1px solid oklch(22% 0.04 240 / 0.4)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleComment}
                    disabled={commentPost.isPending || !commentText.trim()}
                    className="w-8 h-8 rounded-xl flex items-center justify-center disabled:opacity-40 transition-all"
                    style={{
                      background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                    }}
                  >
                    <Send size={13} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
