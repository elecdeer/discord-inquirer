import { defineConfig } from "tsup";

export const createTsupConfig = () =>
	defineConfig({
		entry: ["src/index.ts"],
		format: ["esm", "cjs"],
		target: "node16",
		sourcemap: true,
		dts: true,
		clean: true,
	});
