import type { Api, Model } from "@mariozechner/pi-ai";

export async function getOllamaModels(): Promise<Model<Api>[]> {
	try {
		const res = await fetch("http://localhost:11434/api/tags");
		if (!res.ok) return [];

		const data = (await res.json()) as any;
		if (!data.models) return [];

		return data.models.map((m: any) => ({
			id: m.name,
			name: `${m.name} (Ollama)`,
			api: "openai-completions",
			provider: "ollama",
			baseUrl: "http://localhost:11434/v1",
			reasoning: false,
			input: ["text"],
			cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
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
		}));
	} catch (_e) {
		// Ollama not running or other error
		console.error("Failed to fetch Ollama models:", _e);
		return [];
	}
}
