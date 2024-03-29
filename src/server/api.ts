import type { DynamicController } from "@/components";
import type { ILogger, LoggerConfiguration } from "@/jsx/logging/logger";
import type { SXLGlobalContext } from "lean-jsx-types/context";
import type { Request, Response, NextFunction } from "express";
import { Readable } from "stream";

/**
 * Options to render JSX in a stringified HTML document.
 */
export interface RenderOptions {
  /**
   * The string content of the HTML document to render.
   */
  template?: string;
  /**
   * The string placeholder that will be used to split the document.
   *
   * By default, <!--EAGER_CONTENT--> will be used.
   *
   */
  contentPlaceholder?: string;
  /**
   * Whether the streamed HTML should run in "sync" mode (waiting in sequential
   * order for each JSX component to be rendered)
   */
  sync?: boolean;
}

/**
 * Options for the SXL middleware options
 */
export interface SXLMiddlewareOptions {
  /**
   * A list of {@link DynamicController} objects.
   *
   * These can be created with {@link GetDynamicComponent}
   */
  components?: DynamicController[];
  /**
   * Configure the server response before it's returned
   * @param response
   * @returns
   */
  configResponse?: (response: Response) => Response;
  /**
   * Parse the request params
   * @param args - the request made to the server
   * @param componentName - the name of the component, if this is an async call
   * @returns an object containing parameters for the JSX root component
   */
  globalContextParser: (
    args: Request,
    componentName?: string,
  ) => SXLGlobalContext;
}

/**
 * Options for rendering JSX inside an HTML template
 */
export interface RenderWithTemplateOptions
  extends Omit<RenderOptions, "template"> {
  /**
   * The file path to the HTML template. This path will be used as-is to try to fetch
   * the HTML contents.
   */
  templateName: string;
}

export type ExpressMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void;

/**
 * Main server actions for LeanJSX.
 */
export interface LeanJSX {
  render(
    request: Request,
    res: Response,
    element: SXL.Element,
    options?: { globalContext?: SXLGlobalContext; templateName?: string },
    next?: NextFunction | undefined,
  );
  /**
   * Render a JSX component synchronously. This is meant to be used in API endpoints
   * that return the contents for a subset of components in the application.
   *
   * @param element - The JSX component to render
   * @param globalContext - And optional global context object
   * @returns A {@link Readable} stream
   */
  renderComponent(
    request: Request,
    component: SXL.Element,
    globalContext: SXLGlobalContext,
  ): Promise<Readable>;
  /**
   * Middleware for Express for easily suppoting the rendering of dynamic components
   * in Express.
   *
   * @param options - The {@link SXLMiddlewareOptions}
   * @returns An Express middleware.
   */
  middleware(options: SXLMiddlewareOptions): ExpressMiddleware;

  /**
   * Enable lean.jsx-specific logging
   * @param config - The logging configuration {@link LoggerConfiguration}
   */
  expressLogging(config: LoggerConfiguration): ExpressMiddleware;

  /**
   * Stream a JSX component -inside an HTML template- to an Express HTTP Response.
   *
   * @param res - The Express Response object
   * @param element - The JSX component to render
   * @param options - The {@link RenderWithTemplateOptions}
   * @param next - An Express Middleware "next" function, if available.
   */
  renderWithTemplate(
    req: Request,
    res: Response,
    element: SXL.Element,
    globalContext: SXLGlobalContext,
    options: RenderWithTemplateOptions,
    next?: NextFunction,
  ): Promise<void>;

  /**
   * Get a new instance of {@link ILogger}
   * @param config - the log configuration
   */
  logger(config: LoggerConfiguration): ILogger;
}
