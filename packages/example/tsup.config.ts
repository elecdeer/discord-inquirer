import { createTsupConfig } from "../../tsup.config";

export default createTsupConfig({
  entry: [],
  format: ["esm"],
  target: "node18",
});
