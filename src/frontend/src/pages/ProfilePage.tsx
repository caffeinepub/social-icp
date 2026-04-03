import { DollarSign, Edit3, Grid3X3, Loader2, UserPlus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend.d";
import PostCard from "../components/feed/PostCard";
import { SEED_POSTS, SEED_USERS } from "../data/seedData";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCallerProfile,
  useFollowUser,
  useFollowUserPaid,
  useSaveProfile,
} from "../hooks/useQueries";
import { formatICP, getInitials } from "../lib/helpers";

const AVATAR_IMGS: Record<string, string> = {
  "rdmx6-jaaaa-aaaaa-aaadq-cai": "/assets/generated/avatar-1.dim_200x200.jpg",
  "rrkah-fqaaa-aaaaa-aaaaq-cai": "/assets/generated/avatar-2.dim_200x200.jpg",
};

interface EditProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
  onSave: (updated: UserProfile) => Promise<void>;
}

function EditProfileModal({ profile, onClose, onSave }: EditProfileModalProps) {
  const [form, setForm] = useState({
    displayName: profile.displayName,
    bio: profile.bio,
    followPrice: (Number(profile.followPrice) / 1e8).toString(),
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        ...profile,
        displayName: form.displayName,
        bio: form.bio,
        followPrice: BigInt(
          Math.round(Number.parseFloat(form.followPrice || "0") * 1e8),
        ),
      });
      toast.success("Profile updated!");
      onClose();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)" }}
      data-ocid="edit_profile.modal"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md mx-4 rounded-2xl p-6"
        style={{
          background: "oklch(13% 0.025 240)",
          border: "1px solid oklch(22% 0.04 240 / 0.6)",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3
            id="edit-profile-title"
            className="text-lg font-semibold text-foreground"
          >
            Edit Profile
          </h3>
          <button
            type="button"
            onClick={onClose}
            data-ocid="edit_profile.close_button"
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="edit-display-name"
              className="text-sm font-medium text-muted-foreground block mb-1"
            >
              Display Name
            </label>
            <input
              id="edit-display-name"
              type="text"
              value={form.displayName}
              onChange={(e) =>
                setForm((f) => ({ ...f, displayName: e.target.value }))
              }
              data-ocid="edit_profile.display_name.input"
              className="w-full rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/50"
              style={{
                background: "oklch(17% 0.028 240)",
                border: "1px solid oklch(25% 0.04 240 / 0.5)",
              }}
            />
          </div>
          <div>
            <label
              htmlFor="edit-bio"
              className="text-sm font-medium text-muted-foreground block mb-1"
            >
              Bio
            </label>
            <textarea
              id="edit-bio"
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3}
              maxLength={300}
              data-ocid="edit_profile.bio.textarea"
              className="w-full rounded-xl px-3 py-2.5 text-sm text-foreground resize-none outline-none focus:ring-1 focus:ring-primary/50"
              style={{
                background: "oklch(17% 0.028 240)",
                border: "1px solid oklch(25% 0.04 240 / 0.5)",
              }}
            />
          </div>
          <div>
            <label
              htmlFor="edit-follow-price"
              className="text-sm font-medium text-muted-foreground block mb-1"
            >
              Follow Price (ICP) — 0 for free
            </label>
            <input
              id="edit-follow-price"
              type="number"
              min="0"
              step="0.1"
              value={form.followPrice}
              onChange={(e) =>
                setForm((f) => ({ ...f, followPrice: e.target.value }))
              }
              data-ocid="edit_profile.follow_price.input"
              className="w-full rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/50"
              style={{
                background: "oklch(17% 0.028 240)",
                border: "1px solid oklch(25% 0.04 240 / 0.5)",
              }}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            data-ocid="edit_profile.cancel_button"
            className="flex-1 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-all"
            style={{ background: "oklch(17% 0.028 240)" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            data-ocid="edit_profile.save_button"
            className="flex-1 gradient-btn py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

interface PaidFollowModalProps {
  profile: (typeof SEED_USERS)[0];
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

function PaidFollowModal({
  profile,
  onClose,
  onConfirm,
}: PaidFollowModalProps) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm();
      toast.success(`Successfully followed ${profile.displayName}!`);
      onClose();
    } catch {
      toast.error("Follow transaction failed");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="paid-follow-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)" }}
      data-ocid="paid_follow.modal"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm mx-4 rounded-2xl p-6 text-center"
        style={{
          background: "oklch(13% 0.025 240)",
          border: "1px solid oklch(22% 0.04 240 / 0.6)",
        }}
      >
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
          }}
        >
          <DollarSign size={28} className="text-white" />
        </div>
        <h3
          id="paid-follow-title"
          className="text-xl font-bold text-foreground mb-2"
        >
          Paid Follow
        </h3>
        <p className="text-muted-foreground text-sm mb-4">
          To follow{" "}
          <strong className="text-foreground">{profile.displayName}</strong>,
          you need to send
        </p>
        <div className="text-3xl font-bold gradient-text mb-4">
          {formatICP(profile.followPrice)} ICP
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          This payment will be processed on-chain via the ICP Ledger canister.
          Make sure you have sufficient ICP in your wallet.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            data-ocid="paid_follow.cancel_button"
            className="flex-1 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground"
            style={{ background: "oklch(17% 0.028 240)" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={confirming}
            data-ocid="paid_follow.confirm_button"
            className="flex-1 gradient-btn py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {confirming && <Loader2 size={14} className="animate-spin" />}
            {confirming ? "Processing..." : "Confirm & Pay"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

interface ProfilePageProps {
  principalId?: string;
}

export default function ProfilePage({ principalId }: ProfilePageProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const myPrincipal = identity?.getPrincipal().toString();
  const isOwnProfile = !principalId || principalId === myPrincipal;

  const { data: callerProfile } = useCallerProfile();
  const followUser = useFollowUser();
  const followUserPaid = useFollowUserPaid();
  const saveProfile = useSaveProfile();

  // Use caller profile or find from seed
  const profile = isOwnProfile
    ? (callerProfile ?? SEED_USERS[0])
    : (SEED_USERS.find((u) => u.principalId.toString() === principalId) ??
      SEED_USERS[1]);

  const [showEdit, setShowEdit] = useState(false);
  const [showPaidFollow, setShowPaidFollow] = useState(false);

  const avatarImg = profile
    ? AVATAR_IMGS[profile.principalId.toString()]
    : null;
  const userPosts = SEED_POSTS.filter(
    (p) => profile && p.author.toString() === profile.principalId.toString(),
  );

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.info("Sign in to follow users");
      return;
    }
    if (!profile) return;
    if (profile.followPrice > 0n) {
      setShowPaidFollow(true);
    } else {
      try {
        await followUser.mutateAsync(profile.id);
        toast.success(`Now following ${profile.displayName}!`);
      } catch {
        toast.error("Failed to follow user");
      }
    }
  };

  const handlePaidFollow = async () => {
    if (!profile) return;
    await followUserPaid.mutateAsync({ targetUserId: profile.id, atBlock: 0n });
  };

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card-surface p-12 text-center">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface overflow-hidden mb-5"
      >
        {/* Cover */}
        <div
          className="h-32 relative"
          style={{
            background:
              "linear-gradient(135deg, oklch(20% 0.05 250), oklch(25% 0.06 280))",
          }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "url(/assets/generated/hero-social.dim_1200x600.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>

        <div className="px-5 pb-5">
          {/* Avatar row */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="story-ring" style={{ width: 82, height: 82 }}>
              <div className="story-ring-inner w-full h-full">
                {avatarImg ? (
                  <img
                    src={avatarImg}
                    alt={profile.displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center text-2xl font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                    }}
                  >
                    {getInitials(profile.displayName)}
                  </div>
                )}
              </div>
            </div>

            {isOwnProfile ? (
              <button
                type="button"
                onClick={() => setShowEdit(true)}
                data-ocid="profile.edit.open_modal_button"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-foreground transition-all"
                style={{
                  background: "oklch(17% 0.028 240)",
                  border: "1px solid oklch(25% 0.04 240 / 0.5)",
                }}
              >
                <Edit3 size={14} />
                Edit Profile
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFollow}
                disabled={followUser.isPending || followUserPaid.isPending}
                data-ocid="profile.follow.button"
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                }}
              >
                {followUser.isPending || followUserPaid.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : profile.followPrice > 0n ? (
                  <>
                    <DollarSign size={14} />
                    Pay {formatICP(profile.followPrice)} ICP to Follow
                  </>
                ) : (
                  <>
                    <UserPlus size={14} />
                    Follow
                  </>
                )}
              </button>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {profile.displayName}
            </h1>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
            {profile.bio && (
              <p className="text-sm text-foreground/80 mt-2">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex gap-6 mt-4">
              <div>
                <span className="font-bold text-foreground">
                  {profile.followers.length}
                </span>
                <span className="text-sm text-muted-foreground ml-1">
                  Followers
                </span>
              </div>
              <div>
                <span className="font-bold text-foreground">
                  {profile.following.length}
                </span>
                <span className="text-sm text-muted-foreground ml-1">
                  Following
                </span>
              </div>
              <div>
                <span className="font-bold text-foreground">
                  {userPosts.length}
                </span>
                <span className="text-sm text-muted-foreground ml-1">
                  Posts
                </span>
              </div>
            </div>

            {profile.followPrice > 0n && (
              <div
                className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: "oklch(16% 0.025 240)",
                  border: "1px solid oklch(30% 0.05 263 / 0.3)",
                }}
              >
                <DollarSign size={12} className="text-primary" />
                <span className="text-muted-foreground">Paid follow: </span>
                <span className="gradient-text">
                  {formatICP(profile.followPrice)} ICP
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Posts grid */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Grid3X3 size={18} className="text-primary" />
          Posts
        </h2>
        {userPosts.length === 0 ? (
          <div
            className="card-surface p-12 text-center"
            data-ocid="profile.posts.empty_state"
          >
            <p className="text-muted-foreground text-sm">No posts yet</p>
          </div>
        ) : (
          <div className="space-y-4" data-ocid="profile.posts.list">
            {userPosts.map((post, idx) => (
              <PostCard key={post.id.toString()} post={post} index={idx} />
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEdit && callerProfile && (
          <EditProfileModal
            profile={callerProfile}
            onClose={() => setShowEdit(false)}
            onSave={async (updated) => {
              await saveProfile.mutateAsync(updated);
            }}
          />
        )}
      </AnimatePresence>

      {/* Paid Follow Modal */}
      <AnimatePresence>
        {showPaidFollow && (
          <PaidFollowModal
            profile={profile as (typeof SEED_USERS)[0]}
            onClose={() => setShowPaidFollow(false)}
            onConfirm={handlePaidFollow}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
