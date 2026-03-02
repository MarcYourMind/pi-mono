import type { Model } from "@mariozechner/pi-ai";

export const ollamaMistral: Model<"openai-completions"> = {
	id: "mistral",
	name: "Mistral (Ollama)",
	api: "openai-completions",
	provider: "ollama",
	baseUrl: "http://localhost:11434/v1",

	reasoning: false,
	input: ["text"],

	cost: {
		input: 0,
		output: 0,
		cacheRead: 0,
		cacheWrite: 0,
	},

	contextWindow: 32768,
	maxTokens: 8192,

	compat: {
		supportsStore: false,
		supportsDeveloperRole: false,
		requiresToolResultName: false,
		supportsReasoningEffort: false,
		supportsUsageInStreaming: false,
		maxTokensField: "max_tokens",
	},
};
