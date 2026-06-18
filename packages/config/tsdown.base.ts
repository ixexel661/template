import type { UserConfig } from "tsdown";

export const tsdownBase = {
	format: ["esm"],
	dts: true,
	clean: true,
	treeshake: true,
	target: "es2022",
	platform: "neutral",
} satisfies UserConfig;
