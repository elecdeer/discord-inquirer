// noinspection ES6PreferShortImport
import { rollupConfig } from "../../rollup.config.mjs";

import pkg from "./package.json" assert {type: "json"};

export default rollupConfig({
  pkg: pkg,
  cacheDir: "node_modules/.cache/rollup/node-adaptor"
});
