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

// Static O(1) resolution map for model IDs and common aliases.
// Eliminates linear array scans (SUPPORTED_MODELS.find) and sequential if-branch chains on every completion request.
const MODEL_RESOLUTION_MAP = new Map<string, { wireModel: string; defaultThinkingBudget: number }>();

function registerResolution(alias: string, wireModel: string, defaultThinkingBudget: number) {
  MODEL_RESOLUTION_MAP.set(alias.toLowerCase(), { wireModel, defaultThinkingBudget });
}

// 1. Register explicit model alias variants & thinking tiers
// Gemini 3.8 Flash
registerResolution('gemini-3.8-flash-max', 'gemini-3.8-flash-tiered', 65536);
registerResolution('gemini-3.8-flash:max', 'gemini-3.8-flash-tiered', 65536);
registerResolution('gemini-3.8-flash-xhigh', 'gemini-3.8-flash-tiered', 65536);

registerResolution('gemini-3.8-flash-high', 'gemini-3.8-flash-tiered', 24576);
registerResolution('gemini-3.8-flash:high', 'gemini-3.8-flash-tiered', 24576);

registerResolution('gemini-3.8-flash-medium', 'gemini-3.8-flash-tiered', 8192);
registerResolution('gemini-3.8-flash-mid', 'gemini-3.8-flash-tiered', 8192);
registerResolution('gemini-3.8-flash:medium', 'gemini-3.8-flash-tiered', 8192);
registerResolution('gemini-3.8-flash:mid', 'gemini-3.8-flash-tiered', 8192);
registerResolution('gemini-3.8-flash', 'gemini-3.8-flash-tiered', 8192);
registerResolution('gemini-3.8-flash-tiered', 'gemini-3.8-flash-tiered', 8192);

registerResolution('gemini-3.8-flash-low', 'gemini-3.8-flash-tiered', 2048);
registerResolution('gemini-3.8-flash:low', 'gemini-3.8-flash-tiered', 2048);

registerResolution('gemini-3.8-flash-fast', 'gemini-3.8-flash-tiered', 0);
registerResolution('gemini-3.8-flash:fast', 'gemini-3.8-flash-tiered', 0);
registerResolution('gemini-3.8-flash-off', 'gemini-3.8-flash-tiered', 0);
registerResolution('gemini-3.8-flash:off', 'gemini-3.8-flash-tiered', 0);

// Gemini 3.7 Flash
registerResolution('gemini-3.7-flash-max', 'gemini-3.7-flash-tiered', 65536);
registerResolution('gemini-3.7-flash:max', 'gemini-3.7-flash-tiered', 65536);
registerResolution('gemini-3.7-flash-xhigh', 'gemini-3.7-flash-tiered', 65536);

registerResolution('gemini-3.7-flash-high', 'gemini-3.7-flash-tiered', 24576);
registerResolution('gemini-3.7-flash:high', 'gemini-3.7-flash-tiered', 24576);

registerResolution('gemini-3.7-flash-medium', 'gemini-3.7-flash-tiered', 8192);
registerResolution('gemini-3.7-flash-mid', 'gemini-3.7-flash-tiered', 8192);
registerResolution('gemini-3.7-flash:medium', 'gemini-3.7-flash-tiered', 8192);
registerResolution('gemini-3.7-flash:mid', 'gemini-3.7-flash-tiered', 8192);
registerResolution('gemini-3.7-flash', 'gemini-3.7-flash-tiered', 8192);

registerResolution('gemini-3.7-flash-low', 'gemini-3.7-flash-tiered', 2048);
registerResolution('gemini-3.7-flash:low', 'gemini-3.7-flash-tiered', 2048);

registerResolution('gemini-3.7-flash-fast', 'gemini-3.7-flash-tiered', 0);
registerResolution('gemini-3.7-flash:fast', 'gemini-3.7-flash-tiered', 0);
registerResolution('gemini-3.7-flash-off', 'gemini-3.7-flash-tiered', 0);
registerResolution('gemini-3.7-flash:off', 'gemini-3.7-flash-tiered', 0);

// Gemini 3.6 Flash
registerResolution('gemini-3.6-flash-high', 'gemini-3.7-flash-tiered', 16384);
registerResolution('gemini-3.6-flash:high', 'gemini-3.7-flash-tiered', 16384);

registerResolution('gemini-3.6-flash-medium', 'gemini-3.7-flash-tiered', 8192);
registerResolution('gemini-3.6-flash-mid', 'gemini-3.7-flash-tiered', 8192);
registerResolution('gemini-3.6-flash:medium', 'gemini-3.7-flash-tiered', 8192);
registerResolution('gemini-3.6-flash:mid', 'gemini-3.7-flash-tiered', 8192);
registerResolution('gemini-3.6-flash', 'gemini-3.7-flash-tiered', 8192);

registerResolution('gemini-3.6-flash-low', 'gemini-3.7-flash-tiered', 2048);
registerResolution('gemini-3.6-flash:low', 'gemini-3.7-flash-tiered', 2048);

// Gemini 3.1 Pro
registerResolution('gemini-3.1-pro-low', 'gemini-pro-agent', 4096);
registerResolution('gemini-3.1-pro:low', 'gemini-pro-agent', 4096);
registerResolution('gemini-3.1-pro', 'gemini-pro-agent', 32768);
registerResolution('gemini-pro-agent', 'gemini-pro-agent', 32768);
registerResolution('gemini-pro', 'gemini-pro-agent', 32768);

// Fast Flash
registerResolution('gemini-3.5-flash', 'gemini-3-flash-agent', 0);
registerResolution('gemini-3-flash-agent', 'gemini-3-flash-agent', 0);
registerResolution('gemini-2.5-flash', 'gemini-2.5-flash', 0);

// Claude
registerResolution('claude-sonnet-4-6', 'claude-sonnet-4-6', 16384);
registerResolution('claude-sonnet-4.6', 'claude-sonnet-4-6', 16384);
registerResolution('claude-3-7-sonnet', 'claude-sonnet-4-6', 16384);
registerResolution('claude-3-5-sonnet', 'claude-sonnet-4-6', 16384);
registerResolution('claude-sonnet', 'claude-sonnet-4-6', 16384);

registerResolution('claude-opus-4-6-thinking', 'claude-opus-4-6-thinking', 16384);
registerResolution('claude-opus-4-6', 'claude-opus-4-6-thinking', 16384);
registerResolution('claude-opus', 'claude-opus-4-6-thinking', 16384);

// OpenAI Aliases
registerResolution('gpt-4o', 'gemini-3.7-flash-tiered', 8192);
registerResolution('gpt-4', 'gemini-3.7-flash-tiered', 8192);
registerResolution('gpt-3.5-turbo', 'gemini-3.7-flash-tiered', 8192);
registerResolution('gpt-4o-mini', 'gemini-3.7-flash-tiered', 2048);

// 2. Register base models from SUPPORTED_MODELS catalog (ensures exact catalog IDs take precedence)
for (const m of SUPPORTED_MODELS) {
  registerResolution(m.id, m.wireModel, m.defaultThinkingBudget);
}

export function resolveModel(modelId: string): { wireModel: string; defaultThinkingBudget: number } | null {
  if (!modelId) return null;
  const clean = modelId.trim().toLowerCase();

  const exact = MODEL_RESOLUTION_MAP.get(clean);
  if (exact) {
    return exact;
  }

  // Google internal wire format pass-through
  if (clean.startsWith('publishers/google/models/') || clean.startsWith('models/')) {
    return { wireModel: clean, defaultThinkingBudget: 8192 };
  }

  return null;
}
