import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "@tanstack/react-router";
import { FileText, Search, Users } from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import { SEED_POSTS, SEED_USERS } from "../data/seedData";
import { formatRelativeTime, getInitials, parsePostText } from "../lib/helpers";

const AVATAR_IMGS: Record<string, string> = {
  "rdmx6-jaaaa-aaaaa-aaadq-cai": "/assets/generated/avatar-1.dim_200x200.jpg",
  "rrkah-fqaaa-aaaaa-aaaaq-cai": "/assets/generated/avatar-2.dim_200x200.jpg",
};

export default function ExplorePage() {
  const location = useLocation();
  const queryParam = new URLSearchParams(location.search).get("q") ?? "";
  const [query, setQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState("users");

  const filteredUsers = SEED_USERS.filter(
    (u) =>
      !query ||
      u.displayName.toLowerCase().includes(query.toLowerCase()) ||
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      u.bio.toLowerCase().includes(query.toLowerCase()),
  );

  const filteredPosts = SEED_POSTS.filter(
    (p) => !query || p.content.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground mb-4">Explore</h1>

        {/* Search */}
        <div className="relative mb-5">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, posts, hashtags..."
            data-ocid="explore.search_input"
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50"
            style={{
              background: "oklch(14% 0.025 240)",
              border: "1px solid oklch(22% 0.04 240 / 0.5)",
            }}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList
            className="w-full mb-4"
            style={{
              background: "oklch(14% 0.025 240)",
              border: "1px solid oklch(22% 0.04 240 / 0.4)",
            }}
          >
            <TabsTrigger
              value="users"
              className="flex-1 flex items-center gap-2"
              data-ocid="explore.users.tab"
            >
              <Users size={14} />
              Users ({filteredUsers.length})
            </TabsTrigger>
            <TabsTrigger
              value="posts"
              className="flex-1 flex items-center gap-2"
              data-ocid="explore.posts.tab"
            >
              <FileText size={14} />
              Posts ({filteredPosts.length})
            </TabsTrigger>
          </TabsList>

          {/* Users tab */}
          <TabsContent
            value="users"
            className="space-y-3"
            data-ocid="explore.users.list"
          >
            {filteredUsers.length === 0 ? (
              <div
                className="card-surface p-12 text-center"
                data-ocid="explore.users.empty_state"
              >
                <p className="text-muted-foreground text-sm">No users found</p>
              </div>
            ) : (
              filteredUsers.map((user, idx) => (
                <motion.div
                  key={user.id.toString()}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="card-surface p-4 flex items-center gap-4"
                  data-ocid={`explore.user.item.${idx + 1}`}
                >
                  <div
                    className="story-ring flex-shrink-0"
                    style={{ width: 52, height: 52 }}
                  >
                    <div className="story-ring-inner w-full h-full">
                      {AVATAR_IMGS[user.principalId.toString()] ? (
                        <img
                          src={AVATAR_IMGS[user.principalId.toString()]}
                          alt={user.displayName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full rounded-full flex items-center justify-center font-bold text-white"
                          style={{
                            background: `hsl(${(idx * 60 + 200) % 360}, 65%, 35%)`,
                          }}
                        >
                          {getInitials(user.displayName)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">
                      {user.displayName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @{user.username}
                    </p>
                    <p className="text-xs text-foreground/70 mt-0.5 line-clamp-2">
                      {user.bio}
                    </p>
                    <div className="flex gap-4 mt-2">
                      <span className="text-xs text-muted-foreground">
                        <strong className="text-foreground">
                          {user.followers.length}
                        </strong>{" "}
                        followers
                      </span>
                      <span className="text-xs text-muted-foreground">
                        <strong className="text-foreground">
                          {user.following.length}
                        </strong>{" "}
                        following
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="text-sm px-4 py-2 rounded-xl font-semibold text-white flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                    }}
                    data-ocid={`explore.user.follow.${idx + 1}`}
                  >
                    {user.followPrice > 0n
                      ? `${Number(user.followPrice) / 1e8} ICP`
                      : "Follow"}
                  </button>
                </motion.div>
              ))
            )}
          </TabsContent>

          {/* Posts tab */}
          <TabsContent
            value="posts"
            className="space-y-3"
            data-ocid="explore.posts.list"
          >
            {filteredPosts.length === 0 ? (
              <div
                className="card-surface p-12 text-center"
                data-ocid="explore.posts.empty_state"
              >
                <p className="text-muted-foreground text-sm">No posts found</p>
              </div>
            ) : (
              filteredPosts.map((post, idx) => {
                const postUser = SEED_USERS.find(
                  (u) => u.principalId.toString() === post.author.toString(),
                );
                const parts = parsePostText(post.content);
                return (
                  <motion.div
                    key={post.id.toString()}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="card-surface p-4"
                    data-ocid={`explore.post.item.${idx + 1}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{
                          background: `hsl(${(idx * 60 + 180) % 360}, 60%, 35%)`,
                        }}
                      >
                        {postUser ? getInitials(postUser.displayName) : "U"}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-foreground">
                          {postUser?.displayName}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatRelativeTime(post.timestamp)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80 line-clamp-3">
                      {parts.map((part) =>
                        part.type !== "text" ? (
                          <span key={part.value} style={{ color: "#60A5FA" }}>
                            {part.value}
                          </span>
                        ) : (
                          <span key={part.value}>{part.value}</span>
                        ),
                      )}
                    </p>
                    <div className="flex gap-4 mt-2">
                      <span className="text-xs text-muted-foreground">
                        ♥ {post.likes.length} likes
                      </span>
                      <span className="text-xs text-muted-foreground">
                        💬 {post.comments.length} comments
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
