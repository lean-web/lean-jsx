import type { Request, Response } from "express";
import type { SXLGlobalContext } from "lean-jsx-types/context";
import compression from "compression";

import type { LeanJSX } from "./api";
import {
  DefaultLogger,
  type ILogger,
  type LoggerConfiguration,
} from "@/jsx/logging/logger";
import { ErrorHandler } from "@/jsx/degradation/error-handler";
import {
  type TemplateConfig,
  TemplateManager,
} from "@/jsx/html/template-manager";
import { LeanAppEngine } from "./engine";
import {
  JSXStream,
  type JSXStreamFactory,
  type JSXStreamOptions,
} from "@/jsx/html/stream/jsx-stack";
import { ContextManager } from "@/jsx/context/context-manager";

export const TestLogger = new DefaultLogger({ defaultLogLevel: "silent" });
export { DefaultLogger, ErrorHandler, TemplateManager };
export type { LeanJSX };

/**
 * Configure gzip compression. Don't include streamed/chunked content.
 * @param req - the Express request
 * @param res - The Express response
 * @returns - true if a resource shuold be gziped
 */
export function shouldCompress(req: Request, res: Response) {
  if (
    res.hasHeader("Transfer-Encoding") &&
    res.getHeader("Transfer-Encoding") === "chunked"
  ) {
    return false;
  }

  // fallback to standard filter function
  return compression.filter(req, res);
}

/**
 * The configuration to initialize LeanJSX's runtime.
 */
interface AppConfig {
  /**
     * A map of template configurations. The keys are unique IDs used to render a given HTML template
     * as the skeleton that LeanJSX will be wrapped around while rendering components.
     * 
     * e.g.
     * templates: {
        index: {
            path: INDEX_HTML_PATH,
            contentPlaceholder: "<!--EAGER_CONTENT-->"
        }
    },
     */
  templates: Record<string, TemplateConfig>;
  logging: LoggerConfiguration;
}

/**
 * Create an instance of the LeanJSX runtime. This can be used to render individual components or
 * setup an Express middleware.
 *
 * @param config - the configuration for the runtime.
 * @returns an instance of the LeanJSX runtime.
 */
export function buildApp(config: AppConfig): LeanJSX {
  const logger: ILogger = new DefaultLogger(config.logging);
  const errorHandler = new ErrorHandler(logger);
  const templateManager = new TemplateManager(config.templates, errorHandler);
  const jsxStreamFactory: JSXStreamFactory = (
    root: SXL.Element,
    request: Request,
    globalContext: SXLGlobalContext,
    opts: JSXStreamOptions,
  ) =>
    new JSXStream(
      root,
      new ContextManager(request, globalContext, errorHandler),
      logger,
      opts,
    );
  return new LeanAppEngine(templateManager, jsxStreamFactory);
}
