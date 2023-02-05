import typescript from "@rollup/plugin-typescript";
import { builtinModules } from "module";
import { defineConfig } from "rollup";

import rootPkg from "./package.json" assert {type: "json"};

export const rollupConfig = ({
  pkg = {},
  cacheDir,
  input = "src/index.ts",
}) => defineConfig([
  {
    input: input,
    output: [{
      format: "esm",
      dir: "dist",
      sourcemap: "inline",
      entryFileNames: "[name].mjs",
    }, {
      format: "cjs",
      dir: "dist",
      sourcemap: "inline",
      entryFileNames: "[name].js",
    }],
    external: [
      ...builtinModules,
      ...Object.keys(rootPkg.dependencies ?? {}),
      ...Object.keys(rootPkg.peerDependencies ?? {}),
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.peerDependencies ?? {}),
    ],
    plugins: [typescript({
      cacheDir: cacheDir,
    })],
  },
]);
