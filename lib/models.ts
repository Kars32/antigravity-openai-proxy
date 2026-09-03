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
  // 1. Gemini 3.8 Flash Series (Next-Gen Flagship)
  {
    id: "gemini-3.8-flash-high",
    name: "Gemini 3.8 Flash (High)",
    wireModel: "gemini-3.8-flash-tiered",
    defaultThinkingBudget: 24576,
    description: "Google's next-gen flagship hybrid reasoning model with high thinking budget.",
    tier: "High",
    speed: "Fast",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.8-flash-medium",
    name: "Gemini 3.8 Flash (Medium)",
    wireModel: "gemini-3.8-flash-tiered",
    defaultThinkingBudget: 8192,
    description: "Balanced multimodal and coding reasoning on Gemini 3.8.",
    tier: "Medium",
    speed: "Fast",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.8-flash-low",
    name: "Gemini 3.8 Flash (Low)",
    wireModel: "gemini-3.8-flash-tiered",
    defaultThinkingBudget: 2048,
    description: "Snappy conversational reasoning tier on Gemini 3.8.",
    tier: "Low",
    speed: "Fast",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.8-flash-fast",
    name: "Gemini 3.8 Flash (Fast)",
    wireModel: "gemini-3.8-flash-tiered",
    defaultThinkingBudget: 0,
    description: "Zero-thinking ultra-low latency generation for fast coding tool loops.",
    tier: "Fast",
    speed: "Ultra-Fast",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    wireModel: "gemini-3.8-flash-tiered",
    defaultThinkingBudget: 8192,
    description: "Standard Gemini 3.8 Flash flagship model.",
    tier: "Standard",
    speed: "Fast",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.8-flash-max",
    name: "Gemini 3.8 Flash (Max)",
    wireModel: "gemini-3.8-flash-tiered",
    defaultThinkingBudget: 65536,
    description: "Maximum reasoning budget (64K tokens) for deep architectural planning.",
    tier: "Max",
    speed: "Deep",
    contextWindow: 1048576,
  },

  // 2. Gemini 3.7 Flash Series
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
    description: "Zero-thinking ultra-low latency generation for fast coding tool loops.",
    tier: "Fast",
    speed: "Ultra-Fast",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.7-flash",
    name: "Gemini 3.7 Flash",
    wireModel: "gemini-3.7-flash-tiered",
    defaultThinkingBudget: 8192,
    description: "Standard Gemini 3.7 Flash flagship model.",
    tier: "Standard",
    speed: "Fast",
    contextWindow: 1048576,
  },
  {
    id: "gemini-3.7-flash-max",
    name: "Gemini 3.7 Flash (Max)",
    wireModel: "gemini-3.7-flash-tiered",
    defaultThinkingBudget: 65536,
    description: "Maximum reasoning budget (64K tokens) for deep architectural planning.",
    tier: "Max",
    speed: "Deep",
    contextWindow: 1048576,
  },

  // 2. Gemini 3.1 Pro Series
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
    wireModel: "gemini-pro-agent",
    defaultThinkingBudget: 4096,
    description: "Compact pro tier for structured reasoning.",
    tier: "Low",
    speed: "Medium",
    contextWindow: 1048576,
  },

  // 3. Fast Flash Agent Series
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    wireModel: "gemini-3-flash-agent",
    defaultThinkingBudget: 0,
    description: "Fast agent flash model with zero thinking delay.",
    tier: "Flash",
    speed: "Ultra-Fast",
    contextWindow: 1048576,
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    wireModel: "gemini-2.5-flash",
    defaultThinkingBudget: 0,
    description: "Ultra-stable high-throughput flash architecture.",
    tier: "Flash",
    speed: "Ultra-Fast",
    contextWindow: 1048576,
  },

  // 4. Anthropic Claude Series
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

  // 5. Client Compatibility Aliases
  {
    id: "gpt-4o",
    name: "GPT-4o (Compatibility Alias)",
    wireModel: "gemini-3.7-flash-tiered",
    defaultThinkingBudget: 8192,
    description: "Compatibility alias mapped to Gemini 3.7 Flash.",
    tier: "Alias",
    speed: "Fast",
    contextWindow: 1048576,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini (Compatibility Alias)",
    wireModel: "gemini-3.7-flash-tiered",
    defaultThinkingBudget: 2048,
    description: "Compatibility alias mapped to Gemini 3.7 Flash Low.",
    tier: "Alias",
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

  // Gemini 3.8 Flash variants (high, max, medium/mid, low, fast/off)
  if (clean === 'gemini-3.8-flash-max' || clean === 'gemini-3.8-flash:max' || clean === 'gemini-3.8-flash-xhigh') {
    return { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 65536 };
  }
  if (clean === 'gemini-3.8-flash-high' || clean === 'gemini-3.8-flash:high') {
    return { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 24576 };
  }
  if (clean === 'gemini-3.8-flash-medium' || clean === 'gemini-3.8-flash-mid' || clean === 'gemini-3.8-flash:medium' || clean === 'gemini-3.8-flash:mid' || clean === 'gemini-3.8-flash' || clean === 'gemini-3.8-flash-tiered') {
    return { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 };
  }
  if (clean === 'gemini-3.8-flash-low' || clean === 'gemini-3.8-flash:low') {
    return { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 2048 };
  }
  if (clean === 'gemini-3.8-flash-fast' || clean === 'gemini-3.8-flash:fast' || clean === 'gemini-3.8-flash-off' || clean === 'gemini-3.8-flash:off') {
    return { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 0 };
  }

  // Gemini 3.7 Flash variants (high, max, medium/mid, low, fast/off)
  if (clean === 'gemini-3.7-flash-max' || clean === 'gemini-3.7-flash:max' || clean === 'gemini-3.7-flash-xhigh') {
    return { wireModel: 'gemini-3.7-flash-tiered', defaultThinkingBudget: 65536 };
  }
  if (clean === 'gemini-3.7-flash-high' || clean === 'gemini-3.7-flash:high') {
    return { wireModel: 'gemini-3.7-flash-tiered', defaultThinkingBudget: 24576 };
  }
  if (clean === 'gemini-3.7-flash-medium' || clean === 'gemini-3.7-flash-mid' || clean === 'gemini-3.7-flash:medium' || clean === 'gemini-3.7-flash:mid' || clean === 'gemini-3.7-flash') {
    return { wireModel: 'gemini-3.7-flash-tiered', defaultThinkingBudget: 8192 };
  }
  if (clean === 'gemini-3.7-flash-low' || clean === 'gemini-3.7-flash:low') {
    return { wireModel: 'gemini-3.7-flash-tiered', defaultThinkingBudget: 2048 };
  }
  if (clean === 'gemini-3.7-flash-fast' || clean === 'gemini-3.7-flash:fast' || clean === 'gemini-3.7-flash-off' || clean === 'gemini-3.7-flash:off') {
    return { wireModel: 'gemini-3.7-flash-tiered', defaultThinkingBudget: 0 };
  }

  // Gemini 3.6 Flash variants (mapped to flash-tiered with appropriate thinking budgets)
  if (clean === 'gemini-3.6-flash-high' || clean === 'gemini-3.6-flash:high') {
    return { wireModel: 'gemini-3.7-flash-tiered', defaultThinkingBudget: 16384 };
  }
  if (clean === 'gemini-3.6-flash-medium' || clean === 'gemini-3.6-flash-mid' || clean === 'gemini-3.6-flash:medium' || clean === 'gemini-3.6-flash:mid' || clean === 'gemini-3.6-flash') {
    return { wireModel: 'gemini-3.7-flash-tiered', defaultThinkingBudget: 8192 };
  }
  if (clean === 'gemini-3.6-flash-low' || clean === 'gemini-3.6-flash:low') {
    return { wireModel: 'gemini-3.7-flash-tiered', defaultThinkingBudget: 2048 };
  }

  // Gemini 3.1 Pro variants
  if (clean === 'gemini-3.1-pro-low' || clean === 'gemini-3.1-pro:low') {
    return { wireModel: 'gemini-pro-agent', defaultThinkingBudget: 4096 };
  }
  if (clean === 'gemini-3.1-pro' || clean === 'gemini-pro-agent' || clean === 'gemini-pro') {
    return { wireModel: 'gemini-pro-agent', defaultThinkingBudget: 32768 };
  }

  // Fast flash models
  if (clean === 'gemini-3.5-flash' || clean === 'gemini-3-flash-agent') {
    return { wireModel: 'gemini-3-flash-agent', defaultThinkingBudget: 0 };
  }
  if (clean === 'gemini-2.5-flash') {
    return { wireModel: 'gemini-2.5-flash', defaultThinkingBudget: 0 };
  }

  // Claude models
  if (clean === 'claude-sonnet-4-6' || clean === 'claude-sonnet-4.6' || clean === 'claude-3-7-sonnet' || clean === 'claude-3-5-sonnet' || clean === 'claude-sonnet') {
    return { wireModel: 'claude-sonnet-4-6', defaultThinkingBudget: 16384 };
  }
  if (clean === 'claude-opus-4-6-thinking' || clean === 'claude-opus-4-6' || clean === 'claude-opus') {
    return { wireModel: 'claude-opus-4-6-thinking', defaultThinkingBudget: 16384 };
  }

  // OpenAI aliases
  if (clean === 'gpt-4o' || clean === 'gpt-4' || clean === 'gpt-3.5-turbo') {
    return { wireModel: 'gemini-3.7-flash-tiered', defaultThinkingBudget: 8192 };
  }
  if (clean === 'gpt-4o-mini') {
    return { wireModel: 'gemini-3.7-flash-tiered', defaultThinkingBudget: 2048 };
  }

  // Google internal wire format pass-through
  if (clean.startsWith('publishers/google/models/') || clean.startsWith('models/')) {
    return { wireModel: clean, defaultThinkingBudget: 8192 };
  }

  return null;
}
