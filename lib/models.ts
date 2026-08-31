export interface ModelSpec {
  id: string;
  name: string;
  wireModel: string;
  defaultThinkingBudget: number;
  description: string;
  tier: string;
  contextWindow: number;
}

export const SUPPORTED_MODELS: ModelSpec[] = [
  // 1. Gemini 3.7 Flash Series
  {
    id: "gemini-3.7-flash",
    name: "Gemini 3.7 Flash (High)",
    wireModel: "gemini-3.7-flash-tiered",
    defaultThinkingBudget: 24576,
    description: "Google's hybrid reasoning flagship with high thinking budget.",
    tier: "High",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.7-flash-medium",
    name: "Gemini 3.7 Flash (Medium)",
    wireModel: "gemini-3.7-flash-tiered",
    defaultThinkingBudget: 8192,
    description: "Balanced reasoning and fast multimodal throughput.",
    tier: "Medium",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.7-flash-low",
    name: "Gemini 3.7 Flash (Low)",
    wireModel: "gemini-3.7-flash-tiered",
    defaultThinkingBudget: 2048,
    description: "Snappy conversational reasoning.",
    tier: "Low",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.7-flash-fast",
    name: "Gemini 3.7 Flash (Fast)",
    wireModel: "gemini-3.7-flash-tiered",
    defaultThinkingBudget: 0,
    description: "Instantaneous zero-thinking generation for rapid tool calling.",
    tier: "Fast",
    contextWindow: 1048576,
  },

  // 2. Gemini 3.6 Flash Series
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash (High)",
    wireModel: "gemini-3.6-flash-high",
    defaultThinkingBudget: 16384,
    description: "High-speed reasoning model for coding & agent tasks.",
    tier: "High",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.6-flash-medium",
    name: "Gemini 3.6 Flash (Medium)",
    wireModel: "gemini-3.6-flash-medium",
    defaultThinkingBudget: 8192,
    description: "Optimized speed & balanced reasoning.",
    tier: "Medium",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.6-flash-low",
    name: "Gemini 3.6 Flash (Low)",
    wireModel: "gemini-3.6-flash-low",
    defaultThinkingBudget: 2048,
    description: "Low-latency fast execution tier.",
    tier: "Low",
    contextWindow: 1048576,
  },

  // 3. Gemini 3.1 Pro Series
  {
    id: "gemini-3.1-pro",
    name: "Gemini 3.1 Pro",
    wireModel: "gemini-pro-agent",
    defaultThinkingBudget: 32768,
    description: "Google's deep reasoning & agentic model for complex software architecture.",
    tier: "Agent",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.1-pro-low",
    name: "Gemini 3.1 Pro (Low)",
    wireModel: "gemini-3.1-pro-low",
    defaultThinkingBudget: 4096,
    description: "Compact pro tier for structured reasoning.",
    tier: "Low",
    contextWindow: 1048576,
  },

  // 4. Claude Models
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6 (Thinking)",
    wireModel: "claude-sonnet-4-6",
    defaultThinkingBudget: 16384,
    description: "High-performance Anthropic model for coding, analysis, and architecture.",
    tier: "Thinking",
    contextWindow: 1048576,
  },
  {
    id: "claude-opus-4-6-thinking",
    name: "Claude Opus 4.6 (Thinking)",
    wireModel: "claude-opus-4-6-thinking",
    defaultThinkingBudget: 16384,
    description: "Anthropic's flagship deep reasoning engine.",
    tier: "Thinking",
    contextWindow: 1048576,
  },

  // 5. GPT-OSS Series
  {
    id: "gpt-oss-120b",
    name: "GPT-OSS 120B (Medium)",
    wireModel: "gpt-oss-120b-medium",
    defaultThinkingBudget: 8192,
    description: "Open-weights 120B reasoning model hosted on Google CloudCode infrastructure.",
    tier: "Medium",
    contextWindow: 1048576,
  },

  // 6. Compatibility Aliases (DeepSeek & OpenAI)
  {
    id: "deepseek-reasoner",
    name: "DeepSeek Reasoner (Alias)",
    wireModel: "gemini-3.7-flash-tiered",
    defaultThinkingBudget: 24576,
    description: "DeepSeek R1 reasoning alias routed to Gemini 3.7 Flash High.",
    tier: "Alias",
    contextWindow: 1048576,
  },
  {
    id: "deepseek-chat",
    name: "DeepSeek Chat (Alias)",
    wireModel: "gemini-3.7-flash-tiered",
    defaultThinkingBudget: 0,
    description: "DeepSeek V3 fast chat alias routed to Gemini 3.7 Flash Fast.",
    tier: "Alias",
    contextWindow: 1048576,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o (Alias)",
    wireModel: "gemini-3.7-flash-tiered",
    defaultThinkingBudget: 8192,
    description: "Universal compatibility alias routed to Gemini 3.7 Flash.",
    tier: "Alias",
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

  // 1. Gemini 3.7 variants
  if (clean.includes("3.7") && (clean.includes("high") || clean.includes("max") || clean.includes("think"))) {
    return { wireModel: "gemini-3.7-flash-tiered", defaultThinkingBudget: 24576 };
  }
  if (clean.includes("3.7") && (clean.includes("med"))) {
    return { wireModel: "gemini-3.7-flash-tiered", defaultThinkingBudget: 8192 };
  }
  if (clean.includes("3.7") && (clean.includes("low"))) {
    return { wireModel: "gemini-3.7-flash-tiered", defaultThinkingBudget: 2048 };
  }
  if (clean.includes("3.7") && (clean.includes("fast") || clean.includes("off") || clean.includes("zero"))) {
    return { wireModel: "gemini-3.7-flash-tiered", defaultThinkingBudget: 0 };
  }
  if (clean.includes("3.7") || clean === "gemini-flash") {
    return { wireModel: "gemini-3.7-flash-tiered", defaultThinkingBudget: 8192 };
  }

  // 2. Gemini 3.6 variants
  if (clean.includes("3.6") && clean.includes("high")) {
    return { wireModel: "gemini-3.6-flash-high", defaultThinkingBudget: 16384 };
  }
  if (clean.includes("3.6") && clean.includes("low")) {
    return { wireModel: "gemini-3.6-flash-low", defaultThinkingBudget: 2048 };
  }
  if (clean.includes("3.6")) {
    return { wireModel: "gemini-3.6-flash-medium", defaultThinkingBudget: 8192 };
  }

  // 3. Gemini 3.1 Pro variants
  if (clean.includes("3.1") && clean.includes("low")) {
    return { wireModel: "gemini-3.1-pro-low", defaultThinkingBudget: 4096 };
  }
  if (clean.includes("pro") || clean.includes("3.1")) {
    return { wireModel: "gemini-pro-agent", defaultThinkingBudget: 32768 };
  }

  // 4. Claude models
  if (clean.includes("opus")) {
    return { wireModel: "claude-opus-4-6-thinking", defaultThinkingBudget: 16384 };
  }
  if (clean.includes("claude") || clean.includes("sonnet")) {
    return { wireModel: "claude-sonnet-4-6", defaultThinkingBudget: 16384 };
  }

  // 5. GPT-OSS
  if (clean.includes("oss") || clean.includes("120b")) {
    return { wireModel: "gpt-oss-120b-medium", defaultThinkingBudget: 8192 };
  }

  // 6. Aliases
  if (clean.includes("reasoner") || clean.includes("r1")) {
    return { wireModel: "gemini-3.7-flash-tiered", defaultThinkingBudget: 24576 };
  }
  if (clean.includes("deepseek") || clean.includes("gpt")) {
    return { wireModel: "gemini-3.7-flash-tiered", defaultThinkingBudget: 8192 };
  }

  // Exact Google wire model pass-through
  if (clean.startsWith("publishers/google/models/") || clean.startsWith("models/")) {
    return { wireModel: clean, defaultThinkingBudget: 8192 };
  }

  return { wireModel: "gemini-3.7-flash-tiered", defaultThinkingBudget: 8192 };
}
