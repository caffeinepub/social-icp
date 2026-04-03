import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface DirectMessage {
    id: DirectMessageId;
    text: string;
    recipient: Principal;
    sender: Principal;
    timestamp: Time;
}
export interface AuthenticatedResponse {
    message: string;
    timestamp: Time;
}
export type Time = bigint;
export type StatusUpdateId = bigint;
export interface Comment {
    id: bigint;
    commenter: Principal;
    text: string;
    timestamp: Time;
}
export interface Story {
    id: StoryId;
    content: string;
    author: Principal;
    timestamp: Time;
}
export type StoryId = bigint;
export type PostId = bigint;
export interface StatusUpdate {
    id: StatusUpdateId;
    content: string;
    author: Principal;
    timestamp: Time;
}
export type UserProfileId = bigint;
export interface Blob {
    content: Blob;
}
export type DirectMessageId = bigint;
export interface Notification {
    id: bigint;
    recipient: Principal;
    isRead: boolean;
    message: string;
    timestamp: Time;
}
export interface Post {
    id: PostId;
    content: string;
    author: Principal;
    likes: Array<Principal>;
    timestamp: Time;
    image?: Blob;
    comments: Array<Comment>;
}
export interface UserProfile {
    id: UserProfileId;
    bio: string;
    username: string;
    displayName: string;
    followers: Array<UserProfileId>;
    following: Array<UserProfileId>;
    followPrice: bigint;
    principalId: Principal;
    avatar?: UserProfileId;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignAdminRole(user: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    commentPost(postId: bigint, commentText: string): Promise<Post>;
    createPost(content: string, image: Blob | null): Promise<Post>;
    createStatusUpdate(content: string): Promise<StatusUpdate>;
    createStory(content: string): Promise<Story>;
    createUserProfile(username: string, displayName: string, bio: string, followPrice: bigint): Promise<UserProfile>;
    deleteExpiredStories(): Promise<void>;
    deletePostAsAdmin(postId: bigint): Promise<void>;
    deleteStatusUpdateAsAdmin(statusId: bigint): Promise<void>;
    deleteStoryAsAdmin(storyId: bigint): Promise<void>;
    followUser(targetUserId: UserProfileId): Promise<AuthenticatedResponse>;
    followUserPaid(targetUserId: UserProfileId, atBlock: bigint): Promise<AuthenticatedResponse>;
    getActiveStories(): Promise<Array<Story>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDirectMessagesWith(user: Principal): Promise<Array<DirectMessage>>;
    getFeedPosts(): Promise<Array<Post>>;
    getMessageThreads(): Promise<Array<DirectMessage>>;
    getNotifications(): Promise<Array<Notification>>;
    getStatusUpdates(): Promise<Array<StatusUpdate>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: bigint): Promise<AuthenticatedResponse>;
    markAllNotificationsRead(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(recipient: Principal, text: string): Promise<DirectMessage>;
    unfollowUser(targetUserId: UserProfileId): Promise<AuthenticatedResponse>;
    updateProfileImage(avatar: ExternalBlob): Promise<void>;
}
