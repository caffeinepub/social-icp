import {
  ArrowRight,
  Coins,
  Globe,
  MessageCircle,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import FeedPage from "../components/feed/FeedPage";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const FEATURES = [
  {
    icon: Globe,
    title: "Decentralized Feed",
    description:
      "Posts, photos, and stories stored entirely on-chain. No central server, no censorship.",
  },
  {
    icon: Coins,
    title: "Paid Friendships",
    description:
      "Monetize your network with on-chain ICP token payments. No middlemen.",
  },
  {
    icon: Shield,
    title: "Self-Sovereign Identity",
    description:
      "Internet Identity authentication. You own your data and your keys.",
  },
  {
    icon: MessageCircle,
    title: "Private Messaging",
    description:
      "Direct messages between users, all stored on the Internet Computer blockchain.",
  },
];

export default function LandingPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface overflow-hidden mb-6 relative"
      >
        {/* Background */}
        <div className="relative h-52 overflow-hidden">
          <img
            src="/assets/generated/hero-social.dim_1200x600.jpg"
            alt="SocialICP"
            className="w-full h-full object-cover opacity-40"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(10% 0.04 250 / 0.8), oklch(15% 0.05 280 / 0.9))",
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                }}
              >
                <Zap size={30} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="text-white">Social</span>
                <span className="gradient-text">ICP</span>
              </h1>
              <p className="text-muted-foreground text-sm mb-5">
                The decentralized social platform powered by the Internet
                Computer.
              </p>
              <button
                type="button"
                onClick={login}
                disabled={isLoggingIn}
                data-ocid="landing.signin.button"
                className="gradient-btn px-8 py-3 rounded-xl font-semibold flex items-center gap-2 mx-auto"
              >
                {isLoggingIn
                  ? "Connecting..."
                  : "Sign in with Internet Identity"}
                <ArrowRight size={18} />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Feature pills */}
        <div className="p-4 grid grid-cols-2 gap-3">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="flex items-start gap-2 p-3 rounded-xl"
              style={{ background: "oklch(16% 0.025 240)" }}
            >
              <feature.icon
                size={16}
                className="text-primary flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {feature.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Preview feed (read-only) */}
      <div className="relative">
        <div className="mb-3 flex items-center gap-2">
          <Users size={16} className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            Community Feed Preview
          </h2>
          <span className="ml-auto text-xs text-muted-foreground">
            Sign in to interact
          </span>
        </div>
        <FeedPage />
      </div>
    </div>
  );
}
