import { TrendingUp, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { SEED_USERS, TRENDING_TOPICS } from "../../data/seedData";
import { getInitials } from "../../lib/helpers";

const AVATAR_IMGS = [
  "/assets/generated/avatar-1.dim_200x200.jpg",
  "/assets/generated/avatar-2.dim_200x200.jpg",
  null,
  null,
  null,
];

export default function RightSidebar() {
  return (
    <motion.aside
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="hidden xl:flex flex-col fixed right-0 top-0 h-full w-72 overflow-y-auto"
      style={{
        background: "oklch(11% 0.028 240)",
        borderLeft: "1px solid oklch(22% 0.04 240 / 0.5)",
        padding: "24px 16px",
        scrollbarWidth: "none",
      }}
    >
      {/* Suggested Users */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <UserPlus size={16} className="text-primary" />
            Suggested Users
          </h3>
          <button
            type="button"
            className="text-xs text-primary hover:underline"
          >
            See all
          </button>
        </div>
        <div className="space-y-3">
          {SEED_USERS.slice(0, 4).map((user, idx) => (
            <div key={user.id.toString()} className="flex items-center gap-3">
              <div
                className="story-ring flex-shrink-0"
                style={{ width: 38, height: 38 }}
              >
                <div className="story-ring-inner w-full h-full">
                  {AVATAR_IMGS[idx] ? (
                    <img
                      src={AVATAR_IMGS[idx]!}
                      alt={user.displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{
                        background: `hsl(${(idx * 60 + 200) % 360}, 70%, 40%)`,
                      }}
                    >
                      {getInitials(user.displayName)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {user.displayName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  @{user.username}
                </p>
              </div>
              <button
                type="button"
                className="text-xs px-3 py-1 rounded-full font-semibold text-white flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                }}
              >
                Follow
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Topics */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            Trending Topics
          </h3>
        </div>
        <div className="space-y-2">
          {TRENDING_TOPICS.map((topic, idx) => (
            <div
              key={topic.tag}
              className="flex items-center justify-between p-3 rounded-xl transition-all hover:bg-accent/50 cursor-pointer"
              style={{ background: "oklch(14% 0.025 240)" }}
            >
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#60A5FA" }}
                >
                  {topic.tag}
                </p>
                <p className="text-xs text-muted-foreground">
                  {topic.posts.toLocaleString()} posts
                </p>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                #{idx + 1}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="mt-auto pt-6">
        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </p>
      </div>
    </motion.aside>
  );
}
