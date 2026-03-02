import type { Model, Tool } from "@mariozechner/pi-ai";
import { complete, stream, Type } from "@mariozechner/pi-ai";

// Define Mistral 7B model
const mistralModel: Model<"openai-completions"> = {
	id: "mistral",
	name: "Mistral 7B (Local Ollama)",
	api: "openai-completions",
	provider: "ollama",
	baseUrl: "http://localhost:11434/v1",
	reasoning: false,
	input: ["text"],
	cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
	contextWindow: 32000,
	maxTokens: 8000,
};

// Define tools using TypeBox
const tools: Tool[] = [
	{
		name: "get_time",
		description: "Get the current time",
		parameters: Type.Object({
			timezone: Type.String({
				description: "Timezone (e.g., UTC, America/New_York)",
				default: "UTC",
			}),
		}),
	},
	{
		name: "calculate",
		description: "Perform a mathematical calculation",
		parameters: Type.Object({
			expression: Type.String({
				description: "Mathematical expression (e.g., 2+2, 10*5)",
			}),
		}),
	},
];

async function testMistral() {
	console.log("Testing Mistral 7B with pi-mono...\n");

	// Simple test without tools
	console.log("=== Simple Test ===");
	try {
		const simpleResponse = await complete(
			mistralModel,
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
			mistralModel,
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

	// Test with tool calling
	console.log("=== Tool Calling Test ===");
	try {
		const toolResponse = await complete(
			mistralModel,
			{
				messages: [
					{
						role: "user",
						content: "Get the current time in UTC timezone.",
						timestamp: Date.now(),
					},
				],
				tools,
			},
			{
				apiKey: "ollama", // Dummy key - Ollama doesn't validate it
			},
		);

		console.log("Response received:");
		console.log("Stop reason:", toolResponse.stopReason);
		console.log("Content blocks:", toolResponse.content.length);

		if (toolResponse.stopReason === "error") {
			console.log("Error message:", toolResponse.errorMessage);
		}

		for (const block of toolResponse.content) {
			if (block.type === "text") {
				console.log("Text:", block.text);
			} else if (block.type === "toolCall") {
				console.log(`Tool called: ${block.name}`);
				console.log("Arguments:", JSON.stringify(block.arguments, null, 2));
			}
		}
	} catch (error) {
		console.error("Error in tool test:", error);
	}
	console.log("\n---\n");

	// Test with multiple tool calls
	console.log("=== Multiple Tool Calls Test ===");
	try {
		const multiToolResponse = await complete(
			mistralModel,
			{
				messages: [
					{
						role: "user",
						content: "Calculate 5 plus 3 and tell me the current time in UTC.",
						timestamp: Date.now(),
					},
				],
				tools,
			},
			{
				apiKey: "ollama",
			},
		);

		console.log("Response received:");
		console.log("Stop reason:", multiToolResponse.stopReason);
		console.log("Content blocks:", multiToolResponse.content.length);

		if (multiToolResponse.stopReason === "error") {
			console.log("Error message:", multiToolResponse.errorMessage);
		}

		for (const block of multiToolResponse.content) {
			if (block.type === "text") {
				console.log("Text:", block.text);
			} else if (block.type === "toolCall") {
				console.log(`Tool called: ${block.name}`);
				console.log("Arguments:", JSON.stringify(block.arguments, null, 2));
			}
		}
	} catch (error) {
		console.error("Error in multiple tools test:", error);
	}
}

testMistral().catch(console.error);
