import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  throw new Error("ANTHROPIC_API_KEY is not set");
}

export const anthropic = new Anthropic({ apiKey });

export const DEFAULT_MODEL = "claude-sonnet-4-6"; // ~mai 2026 default
export const PLANNING_MODEL = "claude-opus-4-7"; // For heavier orchestration phases

/**
 * Wrap a system prompt for prompt caching (1h TTL).
 * Use for stable system prompts that will be re-used across many requests.
 */
export function cachedSystem(content: string, ttl: "5m" | "1h" = "1h") {
  return [
    {
      type: "text" as const,
      text: content,
      cache_control: { type: "ephemeral" as const, ttl } as const,
    },
  ];
}
