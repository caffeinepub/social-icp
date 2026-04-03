import type { Principal } from "@icp-sdk/core/principal";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import { toast } from "sonner";
import { SEED_MESSAGES, SEED_USERS } from "../data/seedData";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMessageThreads, useSendMessage } from "../hooks/useQueries";
import { formatRelativeTime, getInitials } from "../lib/helpers";

const AVATAR_IMGS: Record<string, string> = {
  "rdmx6-jaaaa-aaaaa-aaadq-cai": "/assets/generated/avatar-1.dim_200x200.jpg",
  "rrkah-fqaaa-aaaaa-aaaaq-cai": "/assets/generated/avatar-2.dim_200x200.jpg",
};

type Thread = {
  otherUser: (typeof SEED_USERS)[0];
  lastMessage: (typeof SEED_MESSAGES)[0];
  principalStr: string;
};

function buildThreadsFromMessages(
  messages: typeof SEED_MESSAGES,
  myPrincipal?: string,
): Thread[] {
  const seen = new Map<string, Thread>();
  for (const msg of messages) {
    const otherPrincipal =
      msg.sender.toString() === myPrincipal
        ? msg.recipient.toString()
        : msg.sender.toString();
    if (!seen.has(otherPrincipal)) {
      const otherUser = SEED_USERS.find(
        (u) => u.principalId.toString() === otherPrincipal,
      );
      if (otherUser) {
        seen.set(otherPrincipal, {
          otherUser,
          lastMessage: msg,
          principalStr: otherPrincipal,
        });
      }
    }
  }
  return Array.from(seen.values());
}

export default function MessagesPage() {
  const { data: threads } = useMessageThreads();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const myPrincipal = identity?.getPrincipal().toString();
  const sendMessage = useSendMessage();

  const displayMessages =
    threads && threads.length > 0 ? threads : SEED_MESSAGES;
  const displayThreads = buildThreadsFromMessages(displayMessages, myPrincipal);

  const [selectedThread, setSelectedThread] = useState<Thread | null>(
    displayThreads[0] ?? null,
  );
  const [newMessage, setNewMessage] = useState("");

  const threadMessages = displayMessages.filter((m) => {
    if (!selectedThread) return false;
    return (
      m.sender.toString() === selectedThread.principalStr ||
      m.recipient.toString() === selectedThread.principalStr
    );
  });

  const handleSend = async () => {
    if (!isAuthenticated) {
      toast.info("Sign in to send messages");
      return;
    }
    if (!newMessage.trim() || !selectedThread) return;
    try {
      await sendMessage.mutateAsync({
        recipient: selectedThread.otherUser.principalId as unknown as Principal,
        text: newMessage,
      });
      setNewMessage("");
    } catch {
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <MessageCircle size={22} className="text-primary" />
        Messages
      </h1>

      <div
        className="card-surface overflow-hidden flex"
        style={{ height: "calc(100vh - 200px)", minHeight: "400px" }}
      >
        {/* Thread List */}
        <div
          className="w-64 flex-shrink-0 overflow-y-auto"
          style={{ borderRight: "1px solid oklch(22% 0.04 240 / 0.5)" }}
          data-ocid="messages.thread.list"
        >
          <div
            className="p-3 font-semibold text-sm text-muted-foreground"
            style={{ borderBottom: "1px solid oklch(22% 0.04 240 / 0.4)" }}
          >
            Conversations
          </div>
          {displayThreads.length === 0 ? (
            <div className="p-6 text-center" data-ocid="messages.empty_state">
              <p className="text-muted-foreground text-xs">
                No conversations yet
              </p>
            </div>
          ) : (
            displayThreads.map((thread, idx) => (
              <button
                type="button"
                key={thread.principalStr}
                onClick={() => setSelectedThread(thread)}
                data-ocid={`messages.thread.item.${idx + 1}`}
                className={`w-full flex items-center gap-3 px-3 py-3 transition-all text-left ${
                  selectedThread?.principalStr === thread.principalStr
                    ? "bg-primary/10"
                    : "hover:bg-accent/50"
                }`}
              >
                {AVATAR_IMGS[thread.principalStr] ? (
                  <img
                    src={AVATAR_IMGS[thread.principalStr]}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      background: `hsl(${(idx * 70 + 200) % 360}, 60%, 35%)`,
                    }}
                  >
                    {getInitials(thread.otherUser.displayName)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {thread.otherUser.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {thread.lastMessage.text}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Message Thread */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedThread ? (
            <>
              {/* Thread header */}
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: "1px solid oklch(22% 0.04 240 / 0.4)" }}
              >
                {AVATAR_IMGS[selectedThread.principalStr] ? (
                  <img
                    src={AVATAR_IMGS[selectedThread.principalStr]}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                    }}
                  >
                    {getInitials(selectedThread.otherUser.displayName)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {selectedThread.otherUser.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{selectedThread.otherUser.username}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-3"
                data-ocid="messages.chat.panel"
              >
                {threadMessages.map((msg, idx) => {
                  const isMine =
                    msg.sender.toString() === myPrincipal ||
                    (myPrincipal === undefined &&
                      msg.sender.toString() === "rdmx6-jaaaa-aaaaa-aaadq-cai");
                  return (
                    <motion.div
                      key={msg.id.toString()}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                          isMine
                            ? "rounded-tr-sm text-white"
                            : "rounded-tl-sm text-foreground"
                        }`}
                        style={{
                          background: isMine
                            ? "linear-gradient(135deg, #3B82F6, #8B5CF6)"
                            : "oklch(17% 0.028 240)",
                          border: isMine
                            ? "none"
                            : "1px solid oklch(25% 0.04 240 / 0.5)",
                        }}
                      >
                        <p>{msg.text}</p>
                        <p
                          className={`text-[10px] mt-0.5 ${isMine ? "text-white/60" : "text-muted-foreground"}`}
                        >
                          {formatRelativeTime(msg.timestamp)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Send message input */}
              <div
                className="flex items-center gap-3 p-3"
                style={{ borderTop: "1px solid oklch(22% 0.04 240 / 0.4)" }}
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message..."
                  data-ocid="messages.send.input"
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50"
                  style={{
                    background: "oklch(16% 0.028 240)",
                    border: "1px solid oklch(22% 0.04 240 / 0.4)",
                  }}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sendMessage.isPending || !newMessage.trim()}
                  data-ocid="messages.send.button"
                  className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-40 transition-all"
                  style={{
                    background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                  }}
                >
                  {sendMessage.isPending ? (
                    <Loader2 size={16} className="animate-spin text-white" />
                  ) : (
                    <Send size={16} className="text-white" />
                  )}
                </button>
              </div>
            </>
          ) : (
            <div
              className="flex-1 flex items-center justify-center"
              data-ocid="messages.empty_state"
            >
              <div className="text-center">
                <MessageCircle
                  size={48}
                  className="text-muted-foreground mx-auto mb-3"
                />
                <p className="text-muted-foreground">
                  Select a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
