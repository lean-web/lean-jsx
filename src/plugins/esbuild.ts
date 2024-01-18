import { type Plugin } from "esbuild";
console.log("Import fs");
import fs from "fs";
import path from "path";
import { EventExtractor } from "./esbuild/extract-events";
import glob from "fast-glob";
import { HANDLERS_NAMESPACE } from "./constants";

/**
 * A plugin which finds all event handlers used with `withClientData` and bundles them in a JS accessible by the browser.
 *
 * This is necessary because JSX components that render elements with event handlers in a loop
 * will pass their handler code as it is to the browser, increasing the response size by passing a copy of the
 * handler for each element in the loop. This could be very inefficient for large event handlers.
 *
 * This pre-processing help us create a script with a single instance of each event handler,
 * and the script injected by element in a loop would just reference the event handler definition.
 */
const extractEventHandlersPlugin: Plugin = {
  name: "extract-event-handlers",
  setup(build) {
    const extractor = new EventExtractor();

    build.onLoad({ filter: /\.tsx?$/ }, async (args) => {
      const source = await fs.promises.readFile(args.path, "utf8");

      const transformedSource = extractor.fileTransformer(source, args.path);

      return {
        contents: transformedSource,
        loader: "tsx",
      };
    });

    build.onEnd(async (result) => {
      if (result.errors.length > 0) {
        return;
      }
      if (!fs.existsSync(".lean/handlers/")) {
        fs.mkdirSync(".lean/handlers/", { recursive: true });
      }
      const filesAndActions = extractor.getActionsPerFile();
      if (filesAndActions.length === 0) {
        return;
      }

      const cachePath = path.join(process.cwd(), ".lean");
      const files = fs.readdirSync(cachePath);

      for (const f of files) {
        if (f.includes("action-handlers")) {
          fs.rmSync(path.join(cachePath, f));
        }
      }

      await Promise.all(
        filesAndActions
          .map(([fpath, content]) => {
            return [
              path.resolve(
                ".lean/handlers/",
                path.basename(fpath).replace(".tsx", ".ts"),
              ),
              content,
            ];
          })
          .map(([fpath, fcontents]) => fs.promises.writeFile(fpath, fcontents)),
      );

      const fileContents = await Promise.all(
        glob
          .sync(".lean/handlers/**/*.ts")
          .map(async (fpath) => fs.promises.readFile(fpath, "utf8")),
      );

      await build.esbuild.build({
        stdin: { contents: fileContents.join("\n"), loader: "tsx" },
        // outfile: ".lean/action-handlers.js",
        outdir: ".lean",
        entryNames: `[dir]/action-handlers-[hash]`,
        platform: "browser", // Set to 'browser' for IIFE format
        target: ["es2020"], // Target modern browsers or environments
        bundle: true, // Bundle all dependencies into one file
        format: "iife", // Output format as IIFE
        globalName: HANDLERS_NAMESPACE, // Global variable for the IIFE
        external: ["esbuild", "lean-web-utils/lib/server"], // Exclude esbuild from the bundle
      });

      extractor.clear();
    });
  },
};

export default extractEventHandlersPlugin;
