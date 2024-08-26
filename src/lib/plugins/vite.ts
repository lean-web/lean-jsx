import fs from "node:fs";
import type { Plugin } from "vite";
import getScriptContent from "./getScriptContent";
import path from "node:path";
import { transformWithEsbuild } from "vite";
import { createHash } from "crypto";

// const require = createRequire(import.meta.url);

/**
 * A Vite plugin to inject lean-jsx/web/sxl.js into the
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
export function injectScript(packageName: string): Plugin {
  return {
    name: "vite-plugin-inject-script",
    apply: "build",
    transformIndexHtml: {
      enforce: "post",
      transform(html, context) {
        if (context.bundle) {
          const injectedFileNames = Object.keys(context.bundle).filter((key) =>
            /(injected_|assets\/global)/.test(key),
          );

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
    async buildStart() {
      // Inject a single entrypoint for globally-scoped variables declarations.
      const globalFilePath = "src/web/global.ts";
      if (fs.existsSync(globalFilePath)) {
        this.addWatchFile(globalFilePath);
        console.log("Global exists!");
        const code = await transformWithEsbuild(
          fs.readFileSync(globalFilePath, "utf-8"),
          "assets/global.js",
          { loader: "ts" },
        );
        console.log({ code });
        const hash = createHash("sha256")
          .update(code.code)
          .digest("hex")
          .slice(0, 8);
        const hashedFileName = `assets/global.${hash}.js`;

        this.emitFile({
          type: "asset",
          fileName: hashedFileName,
          source: code.code,
        });
      }
    },
    generateBundle(options, bundle) {
      // Read the script content from the package
      const scriptContent = getScriptContent();

      if (fs.existsSync(".lean")) {
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
            break;
          }
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
