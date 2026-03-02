import type { TextContent, ToolCall } from "../types.js";

/**
 * Regex to extract tool calls from Groq Llama models.
 * Matches <function/name {"arg": "val"}>
 */
const TOOL_REGEX = /<function\/(\w+)\s+({[\s\S]*?})>/g;

/**
 * Parse tool calls from a text string and return a sequence of text blocks and tool calls.
 */
export function parseToolCallsFromText(text: string): (TextContent | ToolCall)[] {
	const result: (TextContent | ToolCall)[] = [];
	let lastIndex = 0;

	const matches = text.matchAll(TOOL_REGEX);

	for (const match of matches) {
		const index = match.index!;
		const [fullMatch, toolName, argsRaw] = match;

		// Add leading text if any
		if (index > lastIndex) {
			result.push({
				type: "text",
				text: text.slice(lastIndex, index),
			});
		}

		// Add tool call
		try {
			const args = JSON.parse(argsRaw);
			result.push({
				type: "toolCall",
				id: `call_${Math.random().toString(36).slice(2, 11)}`,
				name: toolName,
				arguments: args,
			});
		} catch (_e) {
			// If JSON parsing fails, treat it as text
			result.push({
				type: "text",
				text: fullMatch,
			});
		}

		lastIndex = index + fullMatch.length;
	}

	// Add trailing text if any
	if (lastIndex < text.length) {
		result.push({
			type: "text",
			text: text.slice(lastIndex),
		});
	}

	return result;
}
