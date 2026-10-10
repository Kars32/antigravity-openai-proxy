import { OPENCODE_MODELS } from './opencode';

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
  },
  ...OPENCODE_MODELS.map(m => ({
    id: m.id,
    name: m.name,
    wireModel: m.wireModel,
    defaultThinkingBudget: m.defaultThinkingBudget,
    description: m.description,
    tier: m.tier,
    speed: m.speed,
    contextWindow: m.contextWindow,
  }))
];

// Module-scoped O(1) hash map pre-populating all exact model IDs, tier variants, and client aliases.
// Avoids O(N) array iteration and sequential conditional checks on every incoming request.
const RESOLVED_MODEL_MAP = new Map<string, { wireModel: string; defaultThinkingBudget: number }>();

function registerModelAlias(aliases: string[], spec: { wireModel: string; defaultThinkingBudget: number }) {
  for (const alias of aliases) {
    RESOLVED_MODEL_MAP.set(alias.toLowerCase(), spec);
  }
}

// 1. Populate standard catalog models
for (const m of SUPPORTED_MODELS) {
  RESOLVED_MODEL_MAP.set(m.id.toLowerCase(), {
    wireModel: m.wireModel,
    defaultThinkingBudget: m.defaultThinkingBudget,
  });
}

// 2. Gemini 3.8 Flash variants
registerModelAlias(['gemini-3.8-flash-max', 'gemini-3.8-flash:max', 'gemini-3.8-flash-xhigh'], { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 65536 });
registerModelAlias(['gemini-3.8-flash-high', 'gemini-3.8-flash:high'], { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 24576 });
registerModelAlias(['gemini-3.8-flash-medium', 'gemini-3.8-flash-mid', 'gemini-3.8-flash:medium', 'gemini-3.8-flash:mid', 'gemini-3.8-flash', 'gemini-3.8-flash-tiered'], { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 8192 });
registerModelAlias(['gemini-3.8-flash-low', 'gemini-3.8-flash:low'], { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 2048 });
registerModelAlias(['gemini-3.8-flash-fast', 'gemini-3.8-flash:fast', 'gemini-3.8-flash-off', 'gemini-3.8-flash:off'], { wireModel: 'gemini-3.8-flash-tiered', defaultThinkingBudget: 0 });

// 3. Gemini 3.7 Flash variants
registerModelAlias(['gemini-3.7-flash-max', 'gemini-3.7-flash:max', 'gemini-3.7-flash-xhigh'], { wireModel: 'gemini-3.7-flash-tiered', defaultThinkingBudget: 65536 });
registerModelAlias(['gemini-3.7-flash-high', 'gemini-3.7-flash:high'], { wireModel: 'gemini-3.7-flash-tiered', defaultThinkingBudget: 24576 });
registerModelAlias(['gemini-3.7-flash-medium', 'gemini-3.7-flash-mid', 'gemini-3.7-flash:medium', 'gemini-3.7-flash:mid', 'gemini-3.7-flash'], { wireModel: 'gemini-3.7-flash-tiered', defaultThinkingBudget: 8192 });
registerModelAlias(['gemini-3.7-flash-low', 'gemini-3.7-flash:low'], { wireModel: 'gemini-3.7-flash-tiered', defaultThinkingBudget: 2048 });
registerModelAlias(['gemini-3.7-flash-fast', 'gemini-3.7-flash:fast', 'gemini-3.7-flash-off', 'gemini-3.7-flash:off'], { wireModel: 'gemini-3.7-flash-tiered', defaultThinkingBudget: 0 });

// 4. Gemini 3.6 Flash variants
registerModelAlias(['gemini-3.6-flash-high', 'gemini-3.6-flash:high'], { wireModel: 'gemini-3.7-flash-tiered', defaultThinkingBudget: 16384 });
registerModelAlias(['gemini-3.6-flash-medium', 'gemini-3.6-flash-mid', 'gemini-3.6-flash:medium', 'gemini-3.6-flash:mid', 'gemini-3.6-flash'], { wireModel: 'gemini-3.7-flash-tiered', defaultThinkingBudget: 8192 });
registerModelAlias(['gemini-3.6-flash-low', 'gemini-3.6-flash:low'], { wireModel: 'gemini-3.7-flash-tiered', defaultThinkingBudget: 2048 });

// 5. Gemini 3.1 Pro variants
registerModelAlias(['gemini-3.1-pro-low', 'gemini-3.1-pro:low'], { wireModel: 'gemini-pro-agent', defaultThinkingBudget: 4096 });
registerModelAlias(['gemini-3.1-pro', 'gemini-pro-agent', 'gemini-pro'], { wireModel: 'gemini-pro-agent', defaultThinkingBudget: 32768 });

// 6. Fast flash models
registerModelAlias(['gemini-3.5-flash', 'gemini-3-flash-agent'], { wireModel: 'gemini-3-flash-agent', defaultThinkingBudget: 0 });
registerModelAlias(['gemini-2.5-flash'], { wireModel: 'gemini-2.5-flash', defaultThinkingBudget: 0 });

// 7. Claude models
registerModelAlias(['claude-sonnet-4-6', 'claude-sonnet-4.6', 'claude-3-7-sonnet', 'claude-3-5-sonnet', 'claude-sonnet'], { wireModel: 'claude-sonnet-4-6', defaultThinkingBudget: 16384 });
registerModelAlias(['claude-opus-4-6-thinking', 'claude-opus-4-6', 'claude-opus'], { wireModel: 'claude-opus-4-6-thinking', defaultThinkingBudget: 16384 });

// 8. OpenAI aliases
registerModelAlias(['gpt-4o', 'gpt-4', 'gpt-3.5-turbo'], { wireModel: 'gemini-3.7-flash-tiered', defaultThinkingBudget: 8192 });
registerModelAlias(['gpt-4o-mini'], { wireModel: 'gemini-3.7-flash-tiered', defaultThinkingBudget: 2048 });

export function resolveModel(modelId: string): { wireModel: string; defaultThinkingBudget: number } | null {
  if (!modelId) return null;
  const clean = modelId.trim().toLowerCase();

  // O(1) hash map lookup
  const cached = RESOLVED_MODEL_MAP.get(clean);
  if (cached) return cached;

  // Google internal wire format pass-through
  if (clean.startsWith('publishers/google/models/') || clean.startsWith('models/')) {
    return { wireModel: clean, defaultThinkingBudget: 8192 };
  }

  return null;
}
