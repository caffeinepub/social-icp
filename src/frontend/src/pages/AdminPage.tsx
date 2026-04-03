import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Shield, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import { toast } from "sonner";
import {
  SEED_POSTS,
  SEED_STATUS_UPDATES,
  SEED_STORIES,
  SEED_USERS,
} from "../data/seedData";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useActiveStories,
  useDeletePost,
  useDeleteStatusUpdate,
  useDeleteStory,
  useFeedPosts,
  useIsAdmin,
  useStatusUpdates,
} from "../hooks/useQueries";
import { formatRelativeTime, getInitials, truncate } from "../lib/helpers";

export default function AdminPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const { data: posts } = useFeedPosts();
  const { data: stories } = useActiveStories();
  const { data: statusUpdates } = useStatusUpdates();
  const deletePost = useDeletePost();
  const deleteStory = useDeleteStory();
  const deleteStatus = useDeleteStatusUpdate();

  const displayPosts = posts && posts.length > 0 ? posts : SEED_POSTS;
  const displayStories = stories && stories.length > 0 ? stories : SEED_STORIES;
  const displayStatus =
    statusUpdates && statusUpdates.length > 0
      ? statusUpdates
      : SEED_STATUS_UPDATES;

  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const handleDeletePost = async (postId: bigint) => {
    setDeletingId(postId);
    try {
      await deletePost.mutateAsync(postId);
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteStory = async (storyId: bigint) => {
    setDeletingId(storyId);
    try {
      await deleteStory.mutateAsync(storyId);
      toast.success("Story deleted");
    } catch {
      toast.error("Failed to delete story");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteStatus = async (statusId: bigint) => {
    setDeletingId(statusId);
    try {
      await deleteStatus.mutateAsync(statusId);
      toast.success("Status update deleted");
    } catch {
      toast.error("Failed to delete status update");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <div
          className="card-surface p-12 text-center"
          data-ocid="admin.auth.error_state"
        >
          <Shield size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            Sign in to access the admin panel
          </p>
        </div>
      </div>
    );
  }

  if (checkingAdmin) {
    return (
      <div className="max-w-2xl mx-auto">
        <div
          className="card-surface p-12 text-center"
          data-ocid="admin.loading_state"
        >
          <Loader2
            size={40}
            className="text-primary mx-auto mb-3 animate-spin"
          />
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto">
        <div
          className="card-surface p-12 text-center"
          data-ocid="admin.unauthorized.error_state"
        >
          <Shield size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">You don't have admin access</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Shield size={22} className="text-primary" />
          Admin Panel
        </h1>

        <Tabs defaultValue="posts">
          <TabsList
            className="w-full mb-5"
            style={{
              background: "oklch(14% 0.025 240)",
              border: "1px solid oklch(22% 0.04 240 / 0.4)",
            }}
          >
            <TabsTrigger
              value="posts"
              className="flex-1"
              data-ocid="admin.posts.tab"
            >
              Posts ({displayPosts.length})
            </TabsTrigger>
            <TabsTrigger
              value="stories"
              className="flex-1"
              data-ocid="admin.stories.tab"
            >
              Stories ({displayStories.length})
            </TabsTrigger>
            <TabsTrigger
              value="status"
              className="flex-1"
              data-ocid="admin.status.tab"
            >
              Status ({displayStatus.length})
            </TabsTrigger>
          </TabsList>

          {/* Posts */}
          <TabsContent
            value="posts"
            className="space-y-3"
            data-ocid="admin.posts.table"
          >
            {displayPosts.map((post, idx) => {
              const user = SEED_USERS.find(
                (u) => u.principalId.toString() === post.author.toString(),
              );
              return (
                <div
                  key={post.id.toString()}
                  className="card-surface p-4 flex items-start gap-3"
                  data-ocid={`admin.post.item.${idx + 1}`}
                >
                  <div
                    className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white"
                    style={{
                      background: `hsl(${(idx * 50 + 200) % 360}, 60%, 35%)`,
                    }}
                  >
                    {user ? getInitials(user.displayName) : "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">
                        {user?.displayName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(post.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 line-clamp-2">
                      {truncate(post.content, 120)}
                    </p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">
                        ♥ {post.likes.length}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        💬 {post.comments.length}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeletePost(post.id)}
                    disabled={deletingId === post.id}
                    data-ocid={`admin.post.delete_button.${idx + 1}`}
                    className="flex-shrink-0 p-2 rounded-xl text-destructive hover:bg-destructive/10 transition-all disabled:opacity-40"
                  >
                    {deletingId === post.id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>
              );
            })}
          </TabsContent>

          {/* Stories */}
          <TabsContent
            value="stories"
            className="space-y-3"
            data-ocid="admin.stories.table"
          >
            {displayStories.map((story, idx) => {
              const user = SEED_USERS.find(
                (u) => u.principalId.toString() === story.author.toString(),
              );
              return (
                <div
                  key={story.id.toString()}
                  className="card-surface p-4 flex items-center gap-3"
                  data-ocid={`admin.story.item.${idx + 1}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">
                        {user?.displayName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(story.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 line-clamp-2">
                      {truncate(story.content, 100)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteStory(story.id)}
                    disabled={deletingId === story.id}
                    data-ocid={`admin.story.delete_button.${idx + 1}`}
                    className="flex-shrink-0 p-2 rounded-xl text-destructive hover:bg-destructive/10 transition-all disabled:opacity-40"
                  >
                    {deletingId === story.id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>
              );
            })}
          </TabsContent>

          {/* Status Updates */}
          <TabsContent
            value="status"
            className="space-y-3"
            data-ocid="admin.status.table"
          >
            {displayStatus.map((status, idx) => {
              const user = SEED_USERS.find(
                (u) => u.principalId.toString() === status.author.toString(),
              );
              return (
                <div
                  key={status.id.toString()}
                  className="card-surface p-4 flex items-center gap-3"
                  data-ocid={`admin.status.item.${idx + 1}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">
                        {user?.displayName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(status.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 line-clamp-2">
                      {truncate(status.content, 100)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteStatus(status.id)}
                    disabled={deletingId === status.id}
                    data-ocid={`admin.status.delete_button.${idx + 1}`}
                    className="flex-shrink-0 p-2 rounded-xl text-destructive hover:bg-destructive/10 transition-all disabled:opacity-40"
                  >
                    {deletingId === status.id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
