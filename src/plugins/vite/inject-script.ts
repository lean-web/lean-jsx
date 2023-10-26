import fs from "node:fs";
import { Plugin } from "vite";

/**
 * A Vite plugin to inject lean-jsx/lib/web/sxl.global.js into the
 * main index.html document.
 *
 * This injection is needed because, by default, Vite bundles all JavaScript
 * into ES modules, which by default are defered.
 *
 * sxl.global.js needs to be executed before the HTML is streamd back from
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
                    const injectedFileName = Object.keys(
                        context.bundle
                    ).find(key => /injected_/.test(key));

                    //   context.
                    if (injectedFileName) {
                        return {
                            html,
                            tags: [
                                {
                                    tag: "script",
                                    attrs: { src: `/${injectedFileName}` },
                                    injectTo: "head"
                                }
                            ]
                        };
                    }
                }
                console.warn("No script to inject was found in the bundle");
            }
        },
        generateBundle(options) {
            // Read the script content from the package
            const scriptContent = fs.readFileSync(
                require.resolve("lean-jsx/lib/web/sxl.global.js"),
                "utf-8"
            );

            // const loaded = await this.resolve(
            //     "lean-jsx/lib/web/sxl.global.js"
            // );

            // Create an injected script asset
            // TODO: Get assets dir from config
            const injectedFileName = options.sanitizeFileName(
                `assets/injected_${packageName}.js`
            );

            this.emitFile({
                type: "prebuilt-chunk",
                fileName: injectedFileName,

                code: scriptContent
            });
        }
    };
}
