import fs from "fs";

export default function getScriptContent() {
  //   return require;

  return fs.readFileSync(require.resolve("lean-jsx/web/sxl.js"), "utf-8");
}
