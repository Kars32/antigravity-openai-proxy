export interface ModelSpec {
  id: string;
  name: string;
  wireModel: string;
  defaultThinkingBudget: number;
  description: string;
  tier: string;
  speed: string;
  contextWindow: number;
}

export const SUPPORTED_MODELS: ModelSpec[] = [
  // 1. Gemini 3.7 Flash Series
  {
    id: "gemini-3.7-flash-high",
    name: "Gemini 3.7 Flash (High)",
    wireModel: "gemini-3.7-flash-tiered",
    defaultThinkingBudget: 24576,
    description: "Flagship hybrid reasoning model with high thinking budget.",
    tier: "High",
    speed: "Fast",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.7-flash-medium",
    name: "Gemini 3.7 Flash (Medium)",
    wireModel: "gemini-3.7-flash-tiered",
    defaultThinkingBudget: 8192,
    description: "Balanced multimodal and coding reasoning.",
    tier: "Medium",
    speed: "Fast",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.7-flash-low",
    name: "Gemini 3.7 Flash (Low)",
    wireModel: "gemini-3.7-flash-tiered",
    defaultThinkingBudget: 2048,
    description: "Snappy conversational reasoning tier.",
    tier: "Low",
    speed: "Fast",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.7-flash-fast",
    name: "Gemini 3.7 Flash (Fast)",
    wireModel: "gemini-3.7-flash-tiered",
    defaultThinkingBudget: 0,
    description: "Zero-thinking ultra-low latency generation for tool calling.",
    tier: "Fast",
    speed: "Ultra-Fast",
    contextWindow: 1048576,
  },

  // 2. Gemini 3.6 Flash Series
  {
    id: "gemini-3.6-flash-high",
    name: "Gemini 3.6 Flash (High)",
    wireModel: "gemini-3.6-flash-high",
    defaultThinkingBudget: 16384,
    description: "High-speed reasoning model for coding & agent tasks.",
    tier: "High",
    speed: "Fast",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.6-flash-medium",
    name: "Gemini 3.6 Flash (Medium)",
    wireModel: "gemini-3.6-flash-medium",
    defaultThinkingBudget: 8192,
    description: "Optimized speed & balanced reasoning.",
    tier: "Medium",
    speed: "Fast",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.6-flash-low",
    name: "Gemini 3.6 Flash (Low)",
    wireModel: "gemini-3.6-flash-low",
    defaultThinkingBudget: 2048,
    description: "Low-latency fast execution tier.",
    tier: "Low",
    speed: "Fast",
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
    speed: "Deep",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.1-pro-low",
    name: "Gemini 3.1 Pro (Low)",
    wireModel: "gemini-3.1-pro-low",
    defaultThinkingBudget: 4096,
    description: "Compact pro tier for structured reasoning.",
    tier: "Low",
    speed: "Medium",
    contextWindow: 1048576,
  },

  // 4. Anthropic Claude
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6 (Thinking)",
    wireModel: "claude-sonnet-4-6",
    defaultThinkingBudget: 16384,
    description: "High-performance Anthropic model for coding, analysis, and architecture.",
    tier: "Thinking",
    speed: "Adaptive",
    contextWindow: 1048576,
  },
  {
    id: "claude-opus-4-6-thinking",
    name: "Claude Opus 4.6 (Thinking)",
    wireModel: "claude-opus-4-6-thinking",
    defaultThinkingBudget: 16384,
    description: "Anthropic's flagship deep reasoning engine.",
    tier: "Thinking",
    speed: "Deep",
    contextWindow: 1048576,
  },

  // 5. GPT-OSS 120B
  {
    id: "gpt-oss-120b-medium",
    name: "GPT-OSS 120B (Medium)",
    wireModel: "gpt-oss-120b-medium",
    defaultThinkingBudget: 8192,
    description: "Open-weights 120B reasoning model hosted on Google CloudCode infrastructure.",
    tier: "Medium",
    speed: "Fast",
    contextWindow: 1048576,
  }
];

export function resolveModel(modelId: string): { wireModel: string; defaultThinkingBudget: number } | null {
  if (!modelId) return null;
  const clean = modelId.trim().toLowerCase();

  // Exact ID match
  const exact = SUPPORTED_MODELS.find(m => m.id === clean);
  if (exact) {
    return { wireModel: exact.wireModel, defaultThinkingBudget: exact.defaultThinkingBudget };
  }

  // Gemini 3.7 Flash variants (high, medium/mid, low, fast)
  if (clean === 'gemini-3.7-flash-high' || clean === 'gemini-3.7-flash:high' || clean === 'gemini-3.7-flash') {
    return { wireModel: 'gemini-3.7-flash-tiered', defaultThinkingBudget: 24576 };
  }
  if (clean === 'gemini-3.7-flash-medium' || clean === 'gemini-3.7-flash-mid' || clean === 'gemini-3.7-flash:medium' || clean === 'gemini-3.7-flash:mid') {
    return { wireModel: 'gemini-3.7-flash-tiered', defaultThinkingBudget: 8192 };
  }
  if (clean === 'gemini-3.7-flash-low' || clean === 'gemini-3.7-flash:low') {
    return { wireModel: 'gemini-3.7-flash-tiered', defaultThinkingBudget: 2048 };
  }
  if (clean === 'gemini-3.7-flash-fast' || clean === 'gemini-3.7-flash:fast' || clean === 'gemini-3.7-flash-off') {
    return { wireModel: 'gemini-3.7-flash-tiered', defaultThinkingBudget: 0 };
  }

  // Gemini 3.6 Flash variants (high, medium/mid, low)
  if (clean === 'gemini-3.6-flash-high' || clean === 'gemini-3.6-flash:high' || clean === 'gemini-3.6-flash') {
    return { wireModel: 'gemini-3.6-flash-high', defaultThinkingBudget: 16384 };
  }
  if (clean === 'gemini-3.6-flash-medium' || clean === 'gemini-3.6-flash-mid' || clean === 'gemini-3.6-flash:medium' || clean === 'gemini-3.6-flash:mid') {
    return { wireModel: 'gemini-3.6-flash-medium', defaultThinkingBudget: 8192 };
  }
  if (clean === 'gemini-3.6-flash-low' || clean === 'gemini-3.6-flash:low') {
    return { wireModel: 'gemini-3.6-flash-low', defaultThinkingBudget: 2048 };
  }

  // Gemini 3.1 Pro variants
  if (clean === 'gemini-3.1-pro-low' || clean === 'gemini-3.1-pro:low') {
    return { wireModel: 'gemini-3.1-pro-low', defaultThinkingBudget: 4096 };
  }
  if (clean === 'gemini-3.1-pro' || clean === 'gemini-pro-agent' || clean === 'gemini-pro') {
    return { wireModel: 'gemini-pro-agent', defaultThinkingBudget: 32768 };
  }

  // Claude models
  if (clean === 'claude-sonnet-4-6' || clean === 'claude-sonnet-4.6') {
    return { wireModel: 'claude-sonnet-4-6', defaultThinkingBudget: 16384 };
  }
  if (clean === 'claude-opus-4-6-thinking' || clean === 'claude-opus-4-6' || clean === 'claude-opus') {
    return { wireModel: 'claude-opus-4-6-thinking', defaultThinkingBudget: 16384 };
  }

  // GPT-OSS 120B
  if (clean === 'gpt-oss-120b-medium' || clean === 'gpt-oss-120b' || clean === 'gpt-oss-120b-mid') {
    return { wireModel: 'gpt-oss-120b-medium', defaultThinkingBudget: 8192 };
  }

  // Google internal wire format pass-through
  if (clean.startsWith('publishers/google/models/') || clean.startsWith('models/')) {
    return { wireModel: clean, defaultThinkingBudget: 8192 };
  }

  return null;
}
