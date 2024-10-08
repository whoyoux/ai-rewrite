"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { generate } from "./actions";
import { readStreamableValue } from "ai/rsc";

export const maxDuration = 30;

export default function Home() {
	const [value, setValue] = useState("");
	const [gen, setGen] = useState("");
	return (
		<div className="max-w-screen-md w-full space-y-4">
			<div>
				<h1 className="text-xl md:text-2xl xl:text-3xl font-bold">
					Ai Rewrite Tool
				</h1>
				<p className="text-base font-normal">
					Automatically rewrite text using AI.
				</p>
			</div>

			<Textarea
				rows={6}
				placeholder="Put your text here"
				onChange={(e) => setValue(e.currentTarget.value)}
				value={value}
			/>
			<div className="flex items-center justify-center">
				<Button
					type="submit"
					onClick={async () => {
						setGen("");
						const { output, error } = await generate(value);

						if (error) {
							// console.error(error);
							alert(error);
							return;
						}

						if (!output) {
							alert("No output. Try again.");
							return;
						}

						for await (const delta of readStreamableValue(output)) {
							setGen((currentGeneration) => `${currentGeneration}${delta}`);
						}
					}}
				>
					Fix it!
				</Button>
			</div>
			<Textarea
				rows={15}
				placeholder="Your rewritten text will appear here"
				readOnly
				value={gen}
			/>
		</div>
	);
}
