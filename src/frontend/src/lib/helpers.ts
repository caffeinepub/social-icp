import type { Time } from "../backend.d";

/**
 * Convert nanosecond timestamp (bigint) to relative time string
 */
export function formatRelativeTime(timestamp: Time): string {
  const nowMs = Date.now();
  const tsMs = Number(timestamp) / 1_000_000; // nanoseconds -> milliseconds
  const diffMs = nowMs - tsMs;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 5) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(tsMs).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Format ICP amount from e8s (1 ICP = 100_000_000 e8s)
 */
export function formatICP(e8s: bigint): string {
  const icp = Number(e8s) / 100_000_000;
  return icp.toFixed(icp < 1 ? 4 : 2);
}

/**
 * Parse text and return JSX-friendly segments with hashtag/mention markers
 */
export function parsePostText(
  text: string,
): Array<{ type: "text" | "hashtag" | "mention"; value: string }> {
  const parts: Array<{ type: "text" | "hashtag" | "mention"; value: string }> =
    [];
  const segments = text.split(/(#\w+|@\w+)/g);
  for (const segment of segments) {
    if (!segment) continue;
    if (segment.startsWith("#")) {
      parts.push({ type: "hashtag", value: segment });
    } else if (segment.startsWith("@")) {
      parts.push({ type: "mention", value: segment });
    } else {
      parts.push({ type: "text", value: segment });
    }
  }
  return parts;
}

/**
 * Truncate text to max length
 */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}

/**
 * Get initials from display name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Shorten principal to display format
 */
export function shortPrincipal(principal: string): string {
  if (principal.length <= 10) return principal;
  return `${principal.slice(0, 5)}...${principal.slice(-4)}`;
}
