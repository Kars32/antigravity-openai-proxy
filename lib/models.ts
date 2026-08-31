export interface ModelSpec {
  id: string;
  name: string;
  wireModel: string;
  defaultThinkingBudget: number;
  description: string;
  contextWindow: number;
}

export const SUPPORTED_MODELS: ModelSpec[] = [
  {
    id: "gemini-3.7-flash",
    name: "Gemini 3.7 Flash",
    wireModel: "gemini-3.7-flash-tiered",
    defaultThinkingBudget: 8192,
    description: "Google's hybrid reasoning and fast multimodal flagship model.",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.7-flash-thinking",
    name: "Gemini 3.7 Flash (Extended Thinking)",
    wireModel: "gemini-3.7-flash-tiered",
    defaultThinkingBudget: 24576,
    description: "Gemini 3.7 with maximum thinking tokens for complex coding & math.",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.7-flash:fast",
    name: "Gemini 3.7 Flash (Fast Mode)",
    wireModel: "gemini-3.7-flash-tiered",
    defaultThinkingBudget: 0,
    description: "Instantaneous zero-thinking generation for snappy tool calling & tasks.",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.1-pro",
    name: "Gemini 3.1 Pro",
    wireModel: "gemini-pro-agent",
    defaultThinkingBudget: 32768,
    description: "Google's deep reasoning and agentic model for complex software engineering.",
    contextWindow: 1048576,
  },
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    wireModel: "claude-sonnet-4-6",
    defaultThinkingBudget: 16384,
    description: "High-performance Anthropic model for coding, analysis, and architecture.",
    contextWindow: 1048576,
  },
  {
    id: "claude-opus-4-6-thinking",
    name: "Claude Opus 4.6 (Thinking)",
    wireModel: "claude-opus-4-6-thinking",
    defaultThinkingBudget: 16384,
    description: "Anthropic's flagship deep reasoning engine.",
    contextWindow: 1048576,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o (Gemini 3.7 Flash Alias)",
    wireModel: "gemini-3.7-flash-tiered",
    defaultThinkingBudget: 8192,
    description: "Universal compatibility alias routed to Gemini 3.7 Flash.",
    contextWindow: 1048576,
  },
  {
    id: "deepseek-reasoner",
    name: "DeepSeek Reasoner (Alias)",
    wireModel: "gemini-3.7-flash-tiered",
    defaultThinkingBudget: 24576,
    description: "DeepSeek R1 reasoning alias routed to Gemini 3.7 Flash High.",
    contextWindow: 1048576,
  },
  {
    id: "deepseek-chat",
    name: "DeepSeek Chat / Coder (Alias)",
    wireModel: "gemini-3.7-flash-tiered",
    defaultThinkingBudget: 0,
    description: "DeepSeek V3 fast chat alias routed to Gemini 3.7 Flash Fast.",
    contextWindow: 1048576,
  }
];

export function resolveModel(modelId: string): { wireModel: string; defaultThinkingBudget: number } | null {
  if (!modelId) return { wireModel: "gemini-3.7-flash-tiered", defaultThinkingBudget: 8192 };
  const clean = modelId.trim().toLowerCase();

  const exact = SUPPORTED_MODELS.find(m => m.id === clean);
  if (exact) {
    return { wireModel: exact.wireModel, defaultThinkingBudget: exact.defaultThinkingBudget };
  }

  // Prefix & wildcard matches
  if (clean.includes("3.7") && (clean.includes("think") || clean.includes("high") || clean.includes("max"))) {
    return { wireModel: "gemini-3.7-flash-tiered", defaultThinkingBudget: 24576 };
  }
  if (clean.includes("3.7") && (clean.includes("fast") || clean.includes("off") || clean.includes("low"))) {
    return { wireModel: "gemini-3.7-flash-tiered", defaultThinkingBudget: 0 };
  }
  if (clean.includes("3.7") || clean.includes("gemini-flash")) {
    return { wireModel: "gemini-3.7-flash-tiered", defaultThinkingBudget: 8192 };
  }
  if (clean.includes("pro") || clean.includes("3.1")) {
    return { wireModel: "gemini-pro-agent", defaultThinkingBudget: 32768 };
  }
  if (clean.includes("opus")) {
    return { wireModel: "claude-opus-4-6-thinking", defaultThinkingBudget: 16384 };
  }
  if (clean.includes("claude") || clean.includes("sonnet")) {
    return { wireModel: "claude-sonnet-4-6", defaultThinkingBudget: 16384 };
  }
  if (clean.includes("reasoner") || clean.includes("r1")) {
    return { wireModel: "gemini-3.7-flash-tiered", defaultThinkingBudget: 24576 };
  }
  if (clean.includes("deepseek") || clean.includes("gpt")) {
    return { wireModel: "gemini-3.7-flash-tiered", defaultThinkingBudget: 8192 };
  }

  if (clean.startsWith("publishers/google/models/") || clean.startsWith("models/")) {
    return { wireModel: clean, defaultThinkingBudget: 8192 };
  }

  return { wireModel: "gemini-3.7-flash-tiered", defaultThinkingBudget: 8192 };
}
