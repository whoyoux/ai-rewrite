"use server";

import { rateLimit } from "@/lib/rate-limit";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { headers } from "next/headers";

export async function generate(input: string) {
	if (
		!input ||
		typeof input !== "string" ||
		input.length < 10 ||
		input.length > 500
	) {
		return { success: false, error: "Invalid input" };
	}

	// TODO: Rate limit
	const ip =
		headers().get("x-forwarded-for") || headers().get("x-real-ip") || "unknown";
	if (!rateLimit(ip)) {
		return {
			success: false,
			error: "Rate limit exceeded. Please try again later.",
		};
	}

	const stream = createStreamableValue();
	(async () => {
		const { textStream } = await streamText({
			model: openai("gpt-4o-mini"),
			system:
				"You are a master in the art of writing. Your task is to rewrite the following text in a more engaging way.",
			messages: [{ role: "user", content: input }],
		});

		for await (const delta of textStream) {
			stream.update(delta);
		}

		stream.done();
	})();

	return {
		success: true,
		output: stream.value,
	};
}
