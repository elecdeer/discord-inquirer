import typescript from "@rollup/plugin-typescript";

import pkg from "./package.json" assert { type: "json" };
import { defineConfig } from "rollup";
import { builtinModules } from "module";

export default defineConfig({
  output: [{
    format: "esm",
    dir: "dist",
    sourcemap: "inline",
    entryFileNames: "[name].mjs",
  }],
  external: [
    ...builtinModules,
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
  ],
  plugins: [typescript({
    cacheDir: "node_modules/.cache/rollup/example",
  })]
});
