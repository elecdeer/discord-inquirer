import { defineConfig, Options } from "tsup";

export const createTsupConfig = (override?: Options) =>
  defineConfig({
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    target: "node16",
    sourcemap: true,
    dts: true,
    clean: true,
    ...(override ?? {}),
  });
