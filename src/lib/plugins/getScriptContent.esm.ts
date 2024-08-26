import fs from "fs";

export default function getScriptContent() {
  //   return require;

  return fs.readFileSync(import.meta.resolve("lean-jsx/web/sxl.js"), "utf-8");
}
