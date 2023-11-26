import ts from "typescript";
import esbuild from "esbuild";
import fs from "fs";
import crypto from "crypto";

/**
 * Replace the handler function's body with a reference to a global reference to the handler
 *
 * @param handler - The expression for the handler function
 * @param ident - The identifier with the reference to the function definition
 * @returns - A new handler function which references a global handler definition.
 */
function replaceHandlerContent(handler: ts.Expression, ident: ts.Expression) {
  if (!(ts.isFunctionExpression(handler) || ts.isArrowFunction(handler))) {
    return handler;
  }
  const newBody = ts.factory.createBlock([
    ts.factory.createExpressionStatement(
      ts.factory.createCallExpression(
        ident,
        undefined,
        handler.parameters.map((p) =>
          ts.factory.createIdentifier(p.name.getText()),
        ),
      ),
    ),
  ]);

  if (ts.isFunctionExpression(handler)) {
    return ts.factory.updateFunctionExpression(
      handler,
      handler.modifiers,
      handler.asteriskToken,
      handler.name,
      handler.typeParameters,
      handler.parameters,
      handler.type,
      newBody,
    );
  }

  if (ts.isArrowFunction(handler)) {
    return ts.factory.updateArrowFunction(
      handler,
      handler.modifiers,
      handler.typeParameters,
      handler.parameters,
      handler.type,
      handler.equalsGreaterThanToken,
      newBody,
    );
  }

  return handler;
}

/**
 * Create a unique name for a function handler.
 * @param fn - the text for the function definition
 * @returns - a string with a unique function name
 */
function generateFunctionName(fn: string) {
  const hash = crypto.createHash("md5").update(fn).digest("hex");
  return `fn${hash}`;
}

/**
 * A plugin which finds all event handlers used with `webAction` and bundles them in a JS accessible by the browser.
 *
 * This is necessary because JSX components that render elements with event handlers in a loop
 * will pass their handler code as it is to the browser, increasing the response size by passing a copy of the
 * handler for each element in the loop. This could be very inefficient for large event handlers.
 *
 * This pre-processing help us create a script with a single instance of each event handler,
 * and the script injected by element in a loop would just reference the event handler definition.
 */
const extractEventHandlersPlugin: esbuild.Plugin = {
  name: "extract-event-handlers",
  setup(build) {
    let eventHandlersBundle = `import { webAction } from "lean-web-utils/lib/server";\ntype Arg = Parameters<typeof webAction>[1];\nwindow.__handlers={};\n`;

    build.onLoad({ filter: /\.tsx?$/ }, async (args) => {
      const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
      });

      const source = await fs.promises.readFile(args.path, "utf8");

      const sourceFile = ts.createSourceFile(
        args.path,
        source,
        ts.ScriptTarget.Latest,
        true,
      );

      const transformer =
        (context: ts.TransformationContext) =>
        (rootNode: ts.SourceFile): ts.SourceFile => {
          function visit<T extends ts.Node>(node: T): T {
            if (
              ts.isCallExpression(node) &&
              ts.isIdentifier(node.expression) &&
              // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
              node.expression.escapedText === "webAction"
            ) {
              const fnText = node.arguments[1].getText();
              const fn = generateFunctionName(fnText);

              // capture the handlers code, and append it to the "sxl" global namespace.
              eventHandlersBundle += `window.sxl.${fn} = ${fnText};\n`;

              // Create a property chain identifier: e.g.: window.sxl.fn1
              const access = ts.factory.createPropertyAccessExpression(
                ts.factory.createPropertyAccessExpression(
                  ts.factory.createIdentifier("window"),
                  "sxl",
                ),
                fn,
              );

              // Replace the body contents:
              const nfn = replaceHandlerContent(node.arguments[1], access);

              return ts.factory.updateCallExpression(
                node,
                node.expression,
                node.typeArguments,
                [node.arguments[0], nfn],
              ) as T & ts.CallExpression;
            }

            return ts.visitEachChild(node, visit, context);
          }
          return ts.visitNode(rootNode, visit) as ts.SourceFile;
        };

      const result = ts.transform(sourceFile, [transformer]);
      const transformedSource = printer.printFile(result.transformed[0]);

      return {
        contents: transformedSource,
        loader: "tsx",
      };
    });

    build.onEnd(async () => {
      // At the end of the build, write the event handlers bundle to a file
      await esbuild.build({
        stdin: {
          contents: eventHandlersBundle,
          loader: "tsx", // specify the appropriate loader (e.g., 'js', 'ts', 'jsx')
        },
        outfile: ".lean/action-handlers.js",
        platform: "browser", // Set to 'browser' for IIFE format
        target: ["es2020"], // Target modern browsers or environments
        bundle: true, // Bundle all dependencies into one file
        format: "esm", // Output format as IIFE
        globalName: "sxlActionHandlers", // Global variable for the IIFE
        external: ["esbuild", "lean-web-utils/lib/server"], // Exclude esbuild from the bundle
      });
    });
  },
};

export default extractEventHandlersPlugin;
