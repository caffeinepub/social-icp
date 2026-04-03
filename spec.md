# Social ICP Platform

## Current State
New project. Empty Motoko actor and no frontend beyond scaffolding.

## Requested Changes (Diff)

### Add
- **User Profiles**: Principal-linked accounts with username, display name, avatar (blob), bio, follower/following counts, and a configurable "paid friendship" price in ICP tokens.
- **Feed Posts**: Rich posts with text, optional photo attachment, likes, and threaded comments. Stored on-chain.
- **Stories**: Ephemeral posts (text or image) with a 24-hour TTL. Expired stories are filtered out on read.
- **Short Posts / Status Updates**: Short text posts (≤280 chars), rendered in a Twitter/X-style timeline.
- **Direct Messaging**: Private 1-to-1 message threads stored on-chain, accessible only to the two participants.
- **Paid Friendships**: A user can set a non-zero ICP price to follow/connect with them. The follower calls the ICP ledger canister to transfer tokens, then the backend verifies and records the connection.
- **Content Management Panel**: Admin/owner view to list, flag, and delete any post, story, or status update.
- **Explore / Discover**: Full-text search and browsing for users and posts. Returns paginated results.
- **Notifications**: In-app notification feed for likes, comments, follows, messages, and paid friendship requests.
- **Sample content**: Seed data to populate the platform with demo users and posts on first load.

### Modify
- Replace empty Motoko actor with a full multi-feature actor.

### Remove
- Nothing (new project).

## Implementation Plan

### Backend (Motoko)
1. Data types: `UserProfile`, `Post`, `Story`, `StatusUpdate`, `DirectMessage`, `Thread`, `Notification`, `PaidFriendshipRequest`.
2. User management: register, update profile, get profile by principal, list all users.
3. Feed: createPost, likePost, addComment, getFeed (paginated), getUserPosts.
4. Stories: createStory, getActiveStories (filter expired by `Time.now()`).
5. Status updates: createStatus, getUserStatuses, getGlobalTimeline.
6. Direct messaging: sendMessage, getThread, listThreads (only accessible by participants).
7. Paid friendships: setFollowPrice, getFollowPrice, requestPaidFriendship, confirmPaidFriendship (after ICP transfer), follow (free), unfollow.
8. Notifications: push notification on like/comment/follow/message, getNotifications, markRead.
9. Explore: searchUsers, searchPosts (simple substring match).
10. Content management: admin deletePost, deleteStory, deleteStatus, flagContent.
11. ICP ledger integration: verify transfer by querying the IC ledger canister for block height / transaction.

### Frontend (React/Tailwind/TypeScript)
1. Auth flow using Internet Identity (via authorization component).
2. Home feed page with story bar at top, feed posts below.
3. Profile page with avatar, bio, follower/following counts, posts grid, follow/paid-follow button.
4. Stories viewer (modal/overlay, auto-advance).
5. Create post modal (text + image upload via blob-storage).
6. Twitter-style short posts timeline tab.
7. Direct Messages inbox + thread view.
8. Explore/Discover page with search bar.
9. Notifications panel/dropdown.
10. Content Management Panel page (only for admin principal).
11. Bottom nav (mobile) / sidebar nav (desktop): Home, Explore, Messages, Notifications, Profile.
