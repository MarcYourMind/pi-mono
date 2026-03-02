import type { Model } from "@mariozechner/pi-ai";
import { complete, stream } from "@mariozechner/pi-ai";

// Define Phi-3 mini model
// NOTE: Phi-3 mini does NOT support tool calling. Use mistral-local.test.ts for tool support.
const phi3Model: Model<"openai-completions"> = {
	id: "phi3:mini",
	name: "Phi-3 Mini (Local Ollama)",
	api: "openai-completions",
	provider: "ollama",
	baseUrl: "http://localhost:11434/v1",
	reasoning: false,
	input: ["text"],
	cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
	contextWindow: 8000,
	maxTokens: 2000,
};

async function testPhi3() {
	console.log("Testing Phi-3 Mini with pi-mono...\n");

	// Simple test without tools
	console.log("=== Simple Test ===");
	try {
		const simpleResponse = await complete(
			phi3Model,
			{
				messages: [
					{
						role: "user",
						content: "Say hello and tell me your name.",
						timestamp: Date.now(),
					},
				],
			},
			{
				apiKey: "ollama-dummy-key", // Dummy key - Ollama doesn't validate it
			},
		);

		console.log("Response received:");
		console.log("Stop reason:", simpleResponse.stopReason);
		console.log("Content blocks:", simpleResponse.content.length);

		for (const block of simpleResponse.content) {
			if (block.type === "text") {
				console.log("Text:", block.text);
			}
		}
	} catch (error) {
		console.error("Error in simple test:", error);
	}
	console.log("\n---\n");

	// Test with streaming
	console.log("=== Streaming Test ===");
	try {
		let textReceived = "";
		const s = stream(
			phi3Model,
			{
				messages: [
					{
						role: "user",
						content: "Write a short poem about coding.",
						timestamp: Date.now(),
					},
				],
			},
			{
				apiKey: "ollama", // Dummy key - Ollama doesn't validate it
			},
		);

		for await (const event of s) {
			if (event.type === "text_delta") {
				process.stdout.write(event.delta);
				textReceived += event.delta;
			} else if (event.type === "error") {
				console.error("Stream error:", event.error.errorMessage);
			}
		}

		console.log("\n\nReceived", textReceived.length, "characters");
	} catch (error) {
		console.error("Error in streaming test:", error);
	}
	console.log("\n---\n");

	// Note: Phi-3 mini does NOT support tool calling
	// See mistral-local.test.ts for tool calling examples
	console.log("Note: Phi-3 mini does not support tool calling.");
	console.log("For tool calling examples, see mistral-local.test.ts");
}

testPhi3().catch(console.error);
