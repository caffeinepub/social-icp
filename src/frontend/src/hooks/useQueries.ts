import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  DirectMessage,
  Notification,
  Post,
  StatusUpdate,
  Story,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

export function useFeedPosts() {
  const { actor, isFetching } = useActor();
  return useQuery<Post[]>({
    queryKey: ["feedPosts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeedPosts();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useActiveStories() {
  const { actor, isFetching } = useActor();
  return useQuery<Story[]>({
    queryKey: ["activeStories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveStories();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useStatusUpdates() {
  const { actor, isFetching } = useActor();
  return useQuery<StatusUpdate[]>({
    queryKey: ["statusUpdates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStatusUpdates();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useNotifications() {
  const { actor, isFetching } = useActor();
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications();
    },
    enabled: !!actor && !isFetching,
    staleTime: 15_000,
  });
}

export function useMessageThreads() {
  const { actor, isFetching } = useActor();
  return useQuery<DirectMessage[]>({
    queryKey: ["messageThreads"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMessageThreads();
    },
    enabled: !!actor && !isFetching,
    staleTime: 15_000,
  });
}

export function useDirectMessages(otherUser: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<DirectMessage[]>({
    queryKey: ["directMessages", otherUser?.toString()],
    queryFn: async () => {
      if (!actor || !otherUser) return [];
      return actor.getDirectMessagesWith(otherUser);
    },
    enabled: !!actor && !isFetching && !!otherUser,
    staleTime: 10_000,
  });
}

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useUserProfile(principal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
    staleTime: 30_000,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.likePost(postId);
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["feedPosts"] });
      const previousPosts = queryClient.getQueryData<Post[]>(["feedPosts"]);
      queryClient.setQueryData<Post[]>(
        ["feedPosts"],
        (old) =>
          old?.map((post) =>
            post.id === postId
              ? { ...post, likes: [...post.likes, "optimistic" as any] }
              : post,
          ) ?? [],
      );
      return { previousPosts };
    },
    onError: (_err, _postId, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["feedPosts"], context.previousPosts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["feedPosts"] });
    },
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      content,
      image,
    }: { content: string; image: null }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createPost(content, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedPosts"] });
    },
  });
}

export function useCreateStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createStory(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeStories"] });
    },
  });
}

export function useCreateStatusUpdate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createStatusUpdate(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statusUpdates"] });
    },
  });
}

export function useCommentPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, text }: { postId: bigint; text: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.commentPost(postId, text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedPosts"] });
    },
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      recipient,
      text,
    }: { recipient: Principal; text: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.sendMessage(recipient, text);
    },
    onSuccess: (_data, { recipient }) => {
      queryClient.invalidateQueries({
        queryKey: ["directMessages", recipient.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["messageThreads"] });
    },
  });
}

export function useMarkNotificationsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not authenticated");
      return actor.markAllNotificationsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (targetUserId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.followUser(targetUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useFollowUserPaid() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      targetUserId,
      atBlock,
    }: { targetUserId: bigint; atBlock: bigint }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.followUserPaid(targetUserId, atBlock);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useCreateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      displayName,
      bio,
      followPrice,
    }: {
      username: string;
      displayName: string;
      bio: string;
      followPrice: bigint;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createUserProfile(username, displayName, bio, followPrice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deletePostAsAdmin(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedPosts"] });
    },
  });
}

export function useDeleteStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (storyId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteStoryAsAdmin(storyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeStories"] });
    },
  });
}

export function useDeleteStatusUpdate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (statusId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteStatusUpdateAsAdmin(statusId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statusUpdates"] });
    },
  });
}
