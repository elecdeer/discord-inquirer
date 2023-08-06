import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";

import { builtinModules } from "module";
import { defineConfig } from "rollup";

import rootPkg from "./package.json" assert { type: "json" };

export const rollupConfig = ({
  pkg = {},
  cacheDir,
  input = "src/index.ts",
}) => {
  return defineConfig([
    {
      input: input,
      output: [
        {
          format: "esm",
          dir: "dist",
          sourcemap: "inline",
          entryFileNames: "[name].mjs",
        },
        {
          format: "cjs",
          dir: "dist",
          sourcemap: "inline",
          entryFileNames: "[name].js",
        },
      ],
      external: [
        ...builtinModules,
        ...Object.keys(rootPkg.dependencies ?? {}),
        ...Object.keys(rootPkg.peerDependencies ?? {}),
        ...Object.keys(pkg.dependencies ?? {}),
        ...Object.keys(pkg.peerDependencies ?? {}),
      ],
      plugins: [
        typescript({
          cacheDir: cacheDir,
        }),
        copy({
          targets: [
            {
              src: "dist/index.d.ts", // d.tsはcjsでもesmでも同じなのでコピーで問題無い
              dest: ".",
              rename: (_name, _extension, fullPath) => {
                return fullPath.replace("d.ts", "d.mts");
              },
            },
          ],
          verbose: true,
          hook: "writeBundle",
        }),
      ],
    },
  ]);
};

// https://github.com/rollup/plugins/issues/1541
// cjsとesmそれぞれで型定義ファイルを分けた方が良いらしいのでこうしている
