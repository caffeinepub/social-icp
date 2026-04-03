import { motion } from "motion/react";
import React from "react";
import { SEED_POSTS } from "../../data/seedData";
import { useFeedPosts } from "../../hooks/useQueries";
import PostCard, { PostCardSkeleton } from "./PostCard";
import StoryBar from "./StoryBar";

export default function FeedPage() {
  const { data: posts, isLoading } = useFeedPosts();
  const displayPosts = posts && posts.length > 0 ? posts : SEED_POSTS;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Stories */}
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface p-4"
      >
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">
          Stories
        </h2>
        <StoryBar />
      </motion.section>

      {/* Feed Posts */}
      <section className="space-y-4" data-ocid="feed.list">
        {isLoading ? (
          [0, 1, 2].map((n) => <PostCardSkeleton key={`feed-skeleton-${n}`} />)
        ) : displayPosts.length === 0 ? (
          <div
            className="card-surface p-12 text-center"
            data-ocid="feed.empty_state"
          >
            <p className="text-muted-foreground text-sm">
              No posts yet. Be the first to share!
            </p>
          </div>
        ) : (
          displayPosts.map((post, idx) => (
            <PostCard key={post.id.toString()} post={post} index={idx} />
          ))
        )}
      </section>
    </div>
  );
}
