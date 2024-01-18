import fs from "node:fs";
import { Plugin } from "vite";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

/**
 * A Vite plugin to inject lean-jsx/lib/web/sxl.js into the
 * main index.html document.
 *
 * This injection is needed because, by default, Vite bundles all JavaScript
 * into ES modules, which by default are defered.
 *
 * sxl.js needs to be executed before the HTML is streamd back from
 * the server, as it provides simple functions to replace placeholder for slow-loading
 * content.
 *
 * @param packageName - the name to use for the injected module.
 * @returns a Vite plugin
 */
export default function injectScript(packageName: string): Plugin {
  return {
    name: "vite-plugin-inject-script",
    apply: "build",
    transformIndexHtml: {
      enforce: "post",
      transform(html, context) {
        if (context.bundle) {
          const injectedFileNames = Object.keys(context.bundle).filter((key) =>
            /injected_/.test(key),
          );

          //   context.
          if (injectedFileNames.length > 0) {
            return {
              html,
              tags: injectedFileNames.map((injectedFileName) => ({
                tag: "script",
                attrs: { src: `/${injectedFileName}` },
                injectTo: "head",
              })),
            };
          }
        }
        console.warn("No script to inject was found in the bundle");
      },
    },
    generateBundle(options) {
      // Read the script content from the package
      const scriptContent = fs.readFileSync(
        require.resolve("lean-jsx/lib/web/sxl.js"),
        "utf-8",
      );

      const cachePath = path.join(process.cwd(), ".lean");
      const files = fs.readdirSync(cachePath);

      for (const f of files) {
        if (f.includes("action-handlers")) {
          const scriptContent2 = fs.readFileSync(
            path.join(cachePath, f),
            "utf-8",
          );

          const injectedFileName2 = options.sanitizeFileName(
            `assets/injected_${f}`,
          );

          this.emitFile({
            type: "prebuilt-chunk",
            fileName: injectedFileName2,
            code: scriptContent2,
          });
        }
      }

      // Create an injected script asset
      // TODO: Get assets dir from config
      const injectedFileName = options.sanitizeFileName(
        `assets/injected_${packageName}.js`,
      );

      this.emitFile({
        type: "prebuilt-chunk",
        fileName: injectedFileName,

        code: scriptContent,
      });
    },
  };
}
