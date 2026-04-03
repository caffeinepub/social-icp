import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  DollarSign,
  Loader2,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useCreateProfile } from "../hooks/useQueries";

interface Props {
  onComplete: () => void;
}

export default function OnboardingPage({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    username: "",
    displayName: "",
    bio: "",
    followPrice: "0",
  });
  const createProfile = useCreateProfile();

  const handleNext = () => {
    if (step === 1) {
      if (!form.username.trim() || !form.displayName.trim()) {
        toast.warning("Please fill in username and display name");
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
        toast.warning(
          "Username can only contain letters, numbers and underscores",
        );
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    try {
      const followPriceE8s = BigInt(
        Math.round(Number.parseFloat(form.followPrice || "0") * 1e8),
      );
      await createProfile.mutateAsync({
        username: form.username,
        displayName: form.displayName,
        bio: form.bio,
        followPrice: followPriceE8s,
      });
      onComplete();
    } catch {
      toast.error("Failed to create profile. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, oklch(10% 0.03 240), oklch(14% 0.04 260))",
      }}
    >
      <div className="w-full max-w-md mx-4">
        {/* Brand */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3B82F6, #8B5CF6)" }}
          >
            <Zap size={30} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold">
            <span className="text-foreground">Social</span>
            <span className="gradient-text">ICP</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Set up your profile to get started
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className="h-1 flex-1 rounded-full transition-all"
              style={{
                background:
                  s <= step
                    ? "linear-gradient(90deg, #3B82F6, #8B5CF6)"
                    : "oklch(22% 0.04 240)",
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card-surface p-6 space-y-4"
              data-ocid="onboarding.step1.card"
            >
              <h2 className="text-xl font-bold text-foreground">
                Create your identity
              </h2>
              <p className="text-sm text-muted-foreground">
                Choose a username and tell the world about yourself
              </p>

              <div>
                <label
                  htmlFor="onboard-display-name"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5"
                >
                  Display Name *
                </label>
                <input
                  id="onboard-display-name"
                  type="text"
                  value={form.displayName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, displayName: e.target.value }))
                  }
                  placeholder="Your full name"
                  data-ocid="onboarding.display_name.input"
                  className="w-full rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50"
                  style={{
                    background: "oklch(17% 0.028 240)",
                    border: "1px solid oklch(25% 0.04 240 / 0.5)",
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="onboard-username"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5"
                >
                  Username *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    @
                  </span>
                  <input
                    id="onboard-username"
                    type="text"
                    value={form.username}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        username: e.target.value.toLowerCase(),
                      }))
                    }
                    placeholder="your_username"
                    data-ocid="onboarding.username.input"
                    className="w-full pl-8 pr-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50"
                    style={{
                      background: "oklch(17% 0.028 240)",
                      border: "1px solid oklch(25% 0.04 240 / 0.5)",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="onboard-bio"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5"
                >
                  Bio
                </label>
                <textarea
                  id="onboard-bio"
                  value={form.bio}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bio: e.target.value }))
                  }
                  placeholder="Tell your story..."
                  rows={3}
                  maxLength={300}
                  data-ocid="onboarding.bio.textarea"
                  className="w-full rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none focus:ring-1 focus:ring-primary/50"
                  style={{
                    background: "oklch(17% 0.028 240)",
                    border: "1px solid oklch(25% 0.04 240 / 0.5)",
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleNext}
                data-ocid="onboarding.step1.next_button"
                className="w-full gradient-btn py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card-surface p-6 space-y-4"
              data-ocid="onboarding.step2.card"
            >
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <DollarSign size={20} className="text-primary" />
                Monetize Your Network
              </h2>
              <p className="text-sm text-muted-foreground">
                Set a price for others to follow you. This creates an on-chain
                paid follow system using real ICP tokens. Set to 0 for a free
                follow.
              </p>

              <div
                className="p-4 rounded-xl"
                style={{
                  background: "oklch(16% 0.028 240)",
                  border: "1px solid oklch(30% 0.05 263 / 0.2)",
                }}
              >
                <label
                  htmlFor="onboard-follow-price"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-3"
                >
                  Follow Price (ICP)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold gradient-text text-sm">
                    ICP
                  </span>
                  <input
                    id="onboard-follow-price"
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.followPrice}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, followPrice: e.target.value }))
                    }
                    data-ocid="onboarding.follow_price.input"
                    className="w-full pl-14 pr-4 py-3 rounded-xl text-lg font-semibold text-foreground outline-none focus:ring-1 focus:ring-primary/50"
                    style={{
                      background: "oklch(19% 0.03 240)",
                      border: "1px solid oklch(28% 0.04 240 / 0.5)",
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {Number.parseFloat(form.followPrice) === 0
                    ? "Free follows"
                    : `${Number.parseFloat(form.followPrice)} ICP per follow`}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  data-ocid="onboarding.step2.back_button"
                  className="px-5 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground transition-all flex items-center gap-2"
                  style={{ background: "oklch(17% 0.028 240)" }}
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={createProfile.isPending}
                  data-ocid="onboarding.submit_button"
                  className="flex-1 gradient-btn py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {createProfile.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  {createProfile.isPending ? "Creating..." : "Create Profile"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
