import type { Request, Response } from "express";
import { SXLGlobalContext } from "lean-jsx/src/types/context";
import compression from "compression";

import {  LeanJSX } from "./api";
import { DefaultLogger, ILogger, LoggerConfiguration } from "@/jsx/logging/logger";
import { ErrorHandler } from "@/jsx/degradation/error-handler";
import { TemplateConfig, TemplateManager } from "@/jsx/html/template-manager";
import { LeanAppEngine } from "./engine";
import { JSXStream, JSXStreamFactory, JSXStreamOptions } from "@/jsx/html/stream/jsx-stack";
import { ContextManager } from "@/jsx/context/context-manager";


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



interface AppConfig {
    templates: Record<string, TemplateConfig>
    logging: LoggerConfiguration;
}

export function buildApp<G extends SXLGlobalContext>(
    config:AppConfig
): LeanJSX<G> {
    const logger: ILogger = new DefaultLogger(config.logging);
    const errorHandler = new ErrorHandler(logger);
    const templateManager = new TemplateManager(config.templates, errorHandler);
    const jsxStreamFactory:JSXStreamFactory<G> = (root: SXL.Element,
        globalContext: G,
        opts: JSXStreamOptions) => new JSXStream(root, new ContextManager(globalContext, errorHandler), logger, opts);
    return new LeanAppEngine(templateManager, jsxStreamFactory);
}
