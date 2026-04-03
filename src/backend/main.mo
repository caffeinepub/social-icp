import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Int "mo:core/Int";

actor {
  // Access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Storage
  include MixinStorage();

  // Stable Variables
  var nextId : Nat = 0;

  // Types
  public type UserProfileId = Nat;
  public type UserProfile = {
    principalId : Principal;
    id : UserProfileId;
    username : Text;
    displayName : Text;
    bio : Text;
    avatar : ?UserProfileId;
    followers : [UserProfileId];
    following : [UserProfileId];
    followPrice : Nat;
  };

  public type PostId = Nat;
  public type Post = {
    id : PostId;
    author : Principal;
    content : Text;
    image : ?Blob;
    timestamp : Time.Time;
    likes : [Principal];
    comments : [Comment];
  };

  public type Comment = {
    id : Nat;
    commenter : Principal;
    text : Text;
    timestamp : Time.Time;
  };

  public type StoryId = Nat;
  public type Story = {
    id : StoryId;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  public type StatusUpdateId = Nat;
  public type StatusUpdate = {
    id : StatusUpdateId;
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  public type DirectMessageId = Nat;
  public type DirectMessage = {
    id : DirectMessageId;
    sender : Principal;
    recipient : Principal;
    text : Text;
    timestamp : Time.Time;
  };

  public type Notification = {
    id : Nat;
    recipient : Principal;
    message : Text;
    timestamp : Time.Time;
    isRead : Bool;
  };

  public type Blob = {
    content : Blob;
  };

  public type AuthenticatedResponse = {
    message : Text;
    timestamp : Time.Time;
  };

  // Comparison function for Post
  module Post {
    public func compare(post1 : Post, post2 : Post) : Order.Order {
      switch (Int.compare(post1.timestamp, post2.timestamp)) {
        case (#equal) { Nat.compare(post1.id, post2.id) };
        case (other) { other };
      };
    };
  };

  // Comparison function for UserProfile
  module UserProfile {
    public func compare(userProfile1 : UserProfile, userProfile2 : UserProfile) : Order.Order {
      Nat.compare(userProfile1.id, userProfile2.id);
    };

    public func compareByUsername(a : UserProfile, b : UserProfile) : Order.Order {
      switch (Text.compare(a.username, b.username)) {
        case (#equal) { Text.compare(a.displayName, b.displayName) };
        case (other) { other };
      };
    };
  };

  // Database simulation (replace with actual Map/Array implementations)
  let userProfiles = Map.empty<Principal, UserProfile>();
  let posts = Map.empty<PostId, Post>();
  let stories = Map.empty<StoryId, Story>();
  let statusUpdates = Map.empty<StatusUpdateId, StatusUpdate>();
  let messages = Map.empty<DirectMessageId, DirectMessage>();
  let notifications = Map.empty<Principal, List.List<Notification>>();

  // User Profile Management
  public shared ({ caller }) func createUserProfile(username : Text, displayName : Text, bio : Text, followPrice : Nat) : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };
    if (userProfiles.containsKey(caller)) { Runtime.trap("This user is already registered.") };
    let id = nextId;
    nextId += 1;

    let profile : UserProfile = {
      principalId = caller;
      id;
      username;
      displayName;
      bio;
      avatar = null;
      followers = [];
      following = [];
      followPrice;
    };

    userProfiles.add(caller, profile);
    createNotification(caller, "Welcome to the Social Platform!");
    profile;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("User profile not found. Create a profile first.");
      };
      case (?existingProfile) {
        let updatedProfile = {
          profile with
          principalId = caller;
          id = existingProfile.id;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Any authenticated user can view other profiles
    userProfiles.get(user);
  };

  // Follow/Unfollow Users
  public shared ({ caller }) func followUser(targetUserId : UserProfileId) : async AuthenticatedResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };

    let callerProfileOpt = userProfiles.get(caller);
    switch (callerProfileOpt) {
      case (null) { Runtime.trap("Caller profile not found") };
      case (?callerProfile) {
        let targetProfileOpt = getUserProfileByIdInternal(targetUserId);
        switch (targetProfileOpt) {
          case (null) { Runtime.trap("Target user not found") };
          case (?targetProfile) {
            if (targetUserId == callerProfile.id) { Runtime.trap("Cannot follow yourself") };

            let alreadyFollowing = callerProfile.following.find(func(id) { id == targetUserId });
            if (alreadyFollowing != null) { Runtime.trap("Already following user") };

            let updatedFollowers = targetProfile.followers.concat([callerProfile.id]);
            let newTargetProfile = {
              targetProfile with
              followers = updatedFollowers;
            };

            let updatedFollowing = callerProfile.following.concat([targetUserId]);
            let newCallerProfile = {
              callerProfile with
              following = updatedFollowing;
            };

            userProfiles.add(caller, newCallerProfile);
            userProfiles.add(targetProfile.principalId, newTargetProfile);
            createNotification(targetProfile.principalId, "You have a new follower!");

            {
              message = "Followed user successfully";
              timestamp = Time.now();
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func unfollowUser(targetUserId : UserProfileId) : async AuthenticatedResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unfollow others");
    };

    let callerProfileOpt = userProfiles.get(caller);
    switch (callerProfileOpt) {
      case (null) { Runtime.trap("Caller profile not found") };
      case (?callerProfile) {
        let targetProfileOpt = getUserProfileByIdInternal(targetUserId);
        switch (targetProfileOpt) {
          case (null) { Runtime.trap("Target user not found") };
          case (?targetProfile) {
            if (targetUserId == callerProfile.id) { Runtime.trap("Cannot unfollow yourself") };

            let isFollowing = callerProfile.following.find(func(id) { id == targetUserId });
            if (isFollowing == null) { Runtime.trap("You are not following this user") };

            let updatedFollowers = targetProfile.followers.filter(func(id) { id != callerProfile.id });
            let newTargetProfile = {
              targetProfile with
              followers = updatedFollowers;
            };

            let updatedFollowing = callerProfile.following.filter(func(id) { id != targetUserId });
            let newCallerProfile = {
              callerProfile with
              following = updatedFollowing;
            };

            userProfiles.add(caller, newCallerProfile);
            userProfiles.add(targetProfile.principalId, newTargetProfile);

            {
              message = "Unfollowed user successfully";
              timestamp = Time.now();
            };
          };
        };
      };
    };
  };

  // Post Management
  public shared ({ caller }) func createPost(content : Text, image : ?Blob) : async Post {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    let postId = nextId;
    nextId += 1;

    let newPost : Post = {
      id = postId;
      author = caller;
      content;
      image;
      timestamp = Time.now();
      likes = [];
      comments = [];
    };

    posts.add(postId, newPost);
    newPost;
  };

  public shared ({ caller }) func likePost(postId : Nat) : async AuthenticatedResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };

    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let alreadyLiked = post.likes.find(func(p) { p == caller });
        if (alreadyLiked != null) { Runtime.trap("Already liked") };

        let updatedLikes = post.likes.concat([caller]);
        let updatedPost = {
          post with
          likes = updatedLikes;
        };

        posts.add(postId, updatedPost);
        createNotification(post.author, "Your post was liked!😀");

        {
          message = "Post liked successfully!";
          timestamp = Time.now();
        };
      };
    };
  };

  public shared ({ caller }) func commentPost(postId : Nat, commentText : Text) : async Post {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can comment on posts");
    };

    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let commentId = nextId;
        nextId += 1;

        let newComment : Comment = {
          id = commentId;
          commenter = caller;
          text = commentText;
          timestamp = Time.now();
        };

        let newComments = post.comments.concat([newComment]);
        let updatedPost = {
          post with
          comments = newComments;
        };

        posts.add(postId, updatedPost);
        createNotification(post.author, "New comment on your post");

        updatedPost;
      };
    };
  };

  public query ({ caller }) func getFeedPosts() : async [Post] {
    // Anyone can view the feed (including guests)
    let postsArray = posts.values().toArray();
    postsArray.sort();
  };

  // Story Management
  public shared ({ caller }) func createStory(content : Text) : async Story {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create stories");
    };

    let id = nextId;
    nextId += 1;

    let newStory : Story = {
      id;
      author = caller;
      content;
      timestamp = Time.now();
    };

    stories.add(id, newStory);
    newStory;
  };

  public query ({ caller }) func getActiveStories() : async [Story] {
    // Anyone can view active stories (including guests)
    let now = Time.now();
    let oneDayNanos = (60 * 60 * 24) * 1_000_000_000;

    let storiesArray = stories.values().toArray();
    storiesArray.filter(func(story) { story.timestamp + oneDayNanos > now });
  };

  public shared ({ caller }) func deleteExpiredStories() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete expired stories");
    };

    let now = Time.now();
    let oneDayNanos = (60 * 60 * 24) * 1_000_000_000;

    for ((id, story) in stories.entries()) {
      if (story.timestamp + oneDayNanos <= now) {
        stories.remove(id);
      };
    };
  };

  // Status Update Management
  public shared ({ caller }) func createStatusUpdate(content : Text) : async StatusUpdate {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create status updates");
    };

    if (content.size() > 280) { Runtime.trap("Status update exceeds 280 characters") };

    let id = nextId;
    nextId += 1;

    let newStatus : StatusUpdate = {
      id;
      author = caller;
      content;
      timestamp = Time.now();
    };

    statusUpdates.add(id, newStatus);
    newStatus;
  };

  public query ({ caller }) func getStatusUpdates() : async [StatusUpdate] {
    // Anyone can view status updates (including guests)
    statusUpdates.values().toArray();
  };

  // Direct Messaging Management
  public shared ({ caller }) func sendMessage(recipient : Principal, text : Text) : async DirectMessage {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    if (recipient == caller) { Runtime.trap("Cannot message yourself") };

    let id = nextId;
    nextId += 1;

    let newMessage : DirectMessage = {
      id;
      sender = caller;
      recipient;
      text;
      timestamp = Time.now();
    };

    messages.add(id, newMessage);
    createNotification(recipient, "You have a new direct message!");
    newMessage;
  };

  public query ({ caller }) func getDirectMessagesWith(user : Principal) : async [DirectMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };

    let messagesArray = messages.values().toArray();
    messagesArray.filter(func(msg) {
      (msg.sender == caller and msg.recipient == user) or (msg.sender == user and msg.recipient == caller)
    });
  };

  public query ({ caller }) func getMessageThreads() : async [DirectMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view message threads");
    };

    let messagesArray = messages.values().toArray();
    messagesArray.filter(func(msg) {
      msg.sender == caller or msg.recipient == caller
    });
  };

  // Paid Friendship Functions
  public shared ({ caller }) func followUserPaid(targetUserId : UserProfileId, atBlock : Nat) : async AuthenticatedResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };

    // TODO: Verify ICP transfer at block height atBlock
    // This would require integration with the IC ledger canister
    await followUser(targetUserId);
  };

  public shared ({ caller }) func updateProfileImage(avatar : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profile images");
    };

    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("User not found. Only registered users can upload images.");
      };
      case (?profile) {
        let updatedProfile = {
          profile with
          avatar = ?profile.id;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  // Notification Functions
  func createNotification(recipient : Principal, message : Text) {
    let id = nextId;
    nextId += 1;

    let newNotification : Notification = {
      id;
      recipient;
      message;
      timestamp = Time.now();
      isRead = false;
    };

    let userNotifications = switch (notifications.get(recipient)) {
      case (null) { List.empty<Notification>() };
      case (?existingNotifications) { existingNotifications };
    };
    userNotifications.add(newNotification);
    notifications.add(recipient, userNotifications);
  };

  public shared ({ caller }) func markAllNotificationsRead() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };

    switch (notifications.get(caller)) {
      case (null) {};
      case (?userNotifications) {
        let updatedNotifications = userNotifications.map<Notification, Notification>(func(n) {
          { n with isRead = true }
        });
        notifications.add(caller, updatedNotifications);
      };
    };
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };

    switch (notifications.get(caller)) {
      case (null) { [] };
      case (?userNotifications) { userNotifications.toArray() };
    };
  };

  // Admin Functions
  public shared ({ caller }) func deletePostAsAdmin(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete posts");
    };
    posts.remove(postId);
  };

  public shared ({ caller }) func deleteStoryAsAdmin(storyId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete stories");
    };
    stories.remove(storyId);
  };

  public shared ({ caller }) func deleteStatusUpdateAsAdmin(statusId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete status updates");
    };
    statusUpdates.remove(statusId);
  };

  public shared ({ caller }) func assignAdminRole(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can assign admin roles");
    };
    AccessControl.assignRole(accessControlState, caller, user, #admin);
  };

  // Internal Helper Functions (not public)
  func getUserProfileByIdInternal(userId : UserProfileId) : ?UserProfile {
    let profilesArray = userProfiles.values().toArray();
    profilesArray.find<UserProfile>(func(x) { x.id == userId });
  };

  func getUserProfileByPrincipalInternal(principal : Principal) : ?UserProfile {
    userProfiles.get(principal);
  };

  // Helper modules for comparing comments
  module Comment {
    public func compare(comment1 : Comment, comment2 : Comment) : Order.Order {
      Int.compare(comment1.timestamp, comment2.timestamp);
    };
  };
};
