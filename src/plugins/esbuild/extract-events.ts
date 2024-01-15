import ts from "typescript";
import crypto from "crypto";
import { HANDLERS_NAMESPACE } from "../constants";

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
    ts.factory.createReturnStatement(
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

interface EventExtractorOptions {
  skipShortHandlers: boolean;
}

export class EventExtractor {
  header = `import { withClientData } from "lean-web-utils/lib/server";\ntype Arg = Parameters<typeof withClientData>[1]`;

  handlers: Record<string, string[]> = {};
  existingHandlers: Set<string> = new Set();
  skipShortHandlers: boolean;

  constructor(options: EventExtractorOptions = { skipShortHandlers: false }) {
    this.skipShortHandlers = options.skipShortHandlers;
  }

  fileTransformer(source: string, filePath = "file.tsx") {
    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed,
    });

    const { existingHandlers, handlers, skipShortHandlers } = this;

    const sourceFile = ts.createSourceFile(
      filePath,
      source,
      ts.ScriptTarget.Latest,
      true,
    );

    const transformer =
      (context: ts.TransformationContext) =>
      (rootNode: ts.SourceFile): ts.SourceFile => {
        function visit<T extends ts.Node>(node: T): T {
          if (
            ts.isJsxSelfClosingElement(node) ||
            ts.isJsxOpeningElement(node)
          ) {
            const newAttributes = node.attributes.properties.map(
              (prop: ts.JsxAttributeLike) => {
                if (
                  ts.isJsxAttribute(prop) &&
                  !!prop.name &&
                  ts.isIdentifier(prop.name) &&
                  !!prop.name.escapedText.toString().match(/^on/) &&
                  !!prop.initializer &&
                  ts.isJsxExpression(prop.initializer) &&
                  !!prop.initializer.expression
                ) {
                  if (
                    ts.isCallExpression(prop.initializer.expression) &&
                    ts.isIdentifier(prop.initializer.expression.expression) &&
                    prop.initializer.expression.expression.escapedText.toString() ===
                      "withClientData"
                  ) {
                    const fnText =
                      prop.initializer.expression.arguments[1].getText();
                    const fn = generateFunctionName(fnText);

                    // Create a property chain identifier: e.g.: window.sxl.fn1
                    const access = ts.factory.createPropertyAccessExpression(
                      ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier("window"),
                        HANDLERS_NAMESPACE,
                      ),
                      fn,
                    );

                    // if the generated function name is longer than the handler itself,
                    // replacing it would not improve performance, so we skip those listeners:
                    if (
                      skipShortHandlers &&
                      printer.printNode(
                        ts.EmitHint.Unspecified,
                        access,
                        sourceFile,
                      ).length < fn.length
                    ) {
                      return prop;
                    }

                    if (!existingHandlers.has(fn)) {
                      // capture the handlers code, and append it to the "sxl" global namespace.
                      if (!handlers[filePath]) {
                        handlers[filePath] = [];
                      }
                      handlers[filePath].push(
                        `export const ${fn} = ${fnText};\n`,
                      );
                      //   eventHandlersBundle += `window.${NAMESPACE}.${fn} = ${fnText};\n`;
                      existingHandlers.add(fn);
                    }

                    // Replace the body contents:
                    const nfn = replaceHandlerContent(
                      prop.initializer.expression.arguments[1],
                      access,
                    );
                    const callExpression = ts.factory.updateCallExpression(
                      prop.initializer.expression,
                      prop.initializer.expression.expression,
                      prop.initializer.expression.typeArguments,
                      [prop.initializer.expression.arguments[0], nfn],
                    ) as T & ts.CallExpression;

                    return ts.factory.updateJsxAttribute(
                      prop,
                      prop.name,
                      ts.factory.updateJsxExpression(
                        prop.initializer,
                        callExpression,
                      ),
                    );
                  } else if (
                    ts.isArrowFunction(prop.initializer.expression) ||
                    ts.isFunctionDeclaration(prop.initializer.expression)
                  ) {
                    const fnText = prop.initializer.expression.getText();
                    const fn = generateFunctionName(fnText);

                    // Create a property chain identifier: e.g.: window.sxl.fn1
                    const access = ts.factory.createPropertyAccessExpression(
                      ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier("window"),
                        HANDLERS_NAMESPACE,
                      ),
                      fn,
                    );

                    // if the generated function name is longer than the handler itself,
                    // replacing it would not improve performance, so we skip those listeners:
                    if (
                      skipShortHandlers &&
                      printer.printNode(
                        ts.EmitHint.Unspecified,
                        access,
                        sourceFile,
                      ).length < fn.length
                    ) {
                      return prop;
                    }

                    if (!existingHandlers.has(fn)) {
                      // capture the handlers code, and append it to the "sxl" global namespace.
                      if (!handlers[filePath]) {
                        handlers[filePath] = [];
                      }
                      handlers[filePath].push(
                        `export const ${fn} = ${fnText};\n`,
                      );
                      //   eventHandlersBundle += `window.${NAMESPACE}.${fn} = ${fnText};\n`;
                      existingHandlers.add(fn);
                    }

                    // Replace the body contents:
                    const expression = replaceHandlerContent(
                      prop.initializer.expression,
                      access,
                    );

                    return ts.factory.updateJsxAttribute(
                      prop,
                      prop.name,
                      ts.factory.updateJsxExpression(
                        prop.initializer,
                        expression,
                      ),
                    );
                  } else {
                    return prop;
                  }
                }
                return prop;
              },
            );

            if (ts.isJsxSelfClosingElement(node)) {
              return ts.factory.updateJsxSelfClosingElement(
                node,
                node.tagName,
                node.typeArguments,
                ts.factory.updateJsxAttributes(node.attributes, newAttributes),
              ) as T & ts.JsxSelfClosingElement;
            }

            if (ts.isJsxOpeningElement(node)) {
              return ts.factory.updateJsxOpeningElement(
                node,
                node.tagName,
                node.typeArguments,
                ts.factory.updateJsxAttributes(node.attributes, newAttributes),
              ) as T & ts.JsxOpeningElement;
            }
          }

          return ts.visitEachChild(node, visit, context);
        }
        return ts.visitNode(rootNode, visit) as ts.SourceFile;
      };

    const result = ts.transform(sourceFile, [transformer]);
    return printer.printFile(result.transformed[0]);
  }

  //   getActionsFile: () => eventHandlersBundle,
  getActionsPerFile() {
    return Object.entries(this.handlers).map(([fpath, handlrs]) => [
      fpath,
      `
          ${this.header}
          // ${fpath}
          ${handlrs.join("\n")}
      `.replace(/\n[\s\t]+/g, "\n"),
    ]);
  }

  clear() {
    this.handlers = {};
    this.existingHandlers = new Set();
  }
}
