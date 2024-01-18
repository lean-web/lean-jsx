import { type Request, type Response, type NextFunction } from "express";
import bodyParser from "body-parser";
import { SXLGlobalContext } from "lean-jsx-types/lib/context";
import {
  ExpressMiddleware,
  LeanJSX,
  RenderWithTemplateOptions,
  SXLMiddlewareOptions,
} from "./api";
import { Readable } from "stream";
import { TemplateManager } from "@/jsx/html/template-manager";
import { JSXStreamFactory } from "@/jsx/html/stream/jsx-stack";
import pinoHttp from "pino-http";
import {
  DefaultLogger,
  ILogger,
  LoggerConfiguration,
  getPinoTransports,
} from "@/jsx/logging/logger";
import fs from "fs";
import path from "path";
import { getDynamicComponentRegistry } from "@/components/component-registry";
import { DynamicController } from "@/components";
import zlib from "zlib";

type RequestLike = Pick<Request, "originalUrl">;

/**
 * Try to retrieve a DynamicComponent's name out of the URL.
 * If it exists, we can handle it directly from the middleware
 * @param req
 * @returns
 */
export function getComponent(req: RequestLike): string | undefined {
  const [_, component] = req.originalUrl.match(/\/components\/([\w-]+)/) ?? [];
  return component;
}

export function isComponentUrl(req: RequestLike): boolean {
  return /\/components\//.test(req.originalUrl);
}

/**
 * Main factory for LeanJSX Engine.
 */
export class LeanAppEngine<G extends SXLGlobalContext> implements LeanJSX<G> {
  private templateManager: TemplateManager;
  private jsxStreamFactory: JSXStreamFactory<G>;

  constructor(
    templateManager: TemplateManager,
    jsxStreamFactory: JSXStreamFactory<G>,
  ) {
    this.templateManager = templateManager;
    this.jsxStreamFactory = jsxStreamFactory;
  }

  /**
   * Render a JSX element into an HTTP response.
   * @param res - the HTTP response
   * @param element - the JSX to render
   * @param options - the rendering options
   * @param next - The Express server "next" hook
   */
  async render(
    res: Response,
    element: SXL.StaticElement,
    options?:
      | { globalContext?: G | undefined; templateName?: string }
      | undefined,
    next?: NextFunction | undefined,
  ) {
    try {
      const [head, tail] = this.templateManager.getHeadAndTail(
        options?.templateName ?? "index",
      );
      const appHtmlStream = this.jsxStreamFactory(
        element,
        options?.globalContext as G,
        {
          pre: [head],
          post: [tail],
          sync: false,
        },
      );

      await appHtmlStream.init();

      const gzip = zlib.createGzip();

      appHtmlStream
        // .pipe(gzip)
        .pipe(
          res.status(200).set({
            "Transfer-Encoding": "chunked",
            "Content-Type": "text/html",
            //   "Content-Encoding": "gzip",
          }),
        );
    } catch (e) {
      if (
        e instanceof Error &&
        "code" in e &&
        e.code === "ERR_STREAM_PREMATURE_CLOSE"
      ) {
        // Most likely the result of users navigating away
        // before stream finishes
      } else {
        if (next) {
          next(e);
        }
      }
    }
  }

  async renderWithTemplate(
    res: Response,
    element: SXL.StaticElement,
    globalContext: G,
    options: RenderWithTemplateOptions,
    next?: NextFunction | undefined,
  ): Promise<void> {
    try {
      const [head, tail] = this.templateManager.getHeadAndTail(
        options.templateName,
      );

      const appHtmlStream = this.jsxStreamFactory(element, globalContext, {
        pre: [head],
        post: [tail],
        sync: options.sync ?? false,
      });

      await appHtmlStream.init();

      appHtmlStream.pipe(res.status(200).set({ "Content-Type": "text/html" }));
    } catch (e) {
      if (
        e instanceof Error &&
        "code" in e &&
        e.code === "ERR_STREAM_PREMATURE_CLOSE"
      ) {
        // Most likely the result of users navigating away
        // before stream finishes
      } else {
        if (next) {
          next(e);
        }
      }
    }
  }

  async renderComponent(
    component: SXL.Element,
    globalContext: G,
  ): Promise<Readable> {
    const stream = this.jsxStreamFactory(await component, globalContext, {
      pre: ["<!DOCTYPE html><body>"],
      post: ["</body>"],
      sync: true,
    });
    await stream.init();
    return stream;
  }

  expressLogging(config: LoggerConfiguration): ExpressMiddleware {
    Object.values(config.file ?? {}).forEach((fileConfig) => {
      const logDir = path.dirname(fileConfig.destination);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    });
    return pinoHttp({ transport: { targets: getPinoTransports(config) } });
  }

  private buildControllerMap(
    components: DynamicController<G, SXL.Props<object, G>>[] | undefined,
  ): Record<string, DynamicController<G>> {
    const dcRegistry = getDynamicComponentRegistry();

    return {
      ...(components
        ? Object.fromEntries(
            components.map((controller) => [controller.contentId, controller]),
          )
        : {}),
      ...dcRegistry,
    };
  }

  middleware(options: SXLMiddlewareOptions<G>): ExpressMiddleware {
    const bodyParserMid = bodyParser.urlencoded({ extended: true });

    const controllerMap = this.buildControllerMap(options.components);

    const { configResponse, globalContextParser } = options;

    return (req: Request, res: Response, next: NextFunction) => {
      bodyParserMid(req, res, (err) => {
        if (err) {
          return next(err);
        }
        try {
          const isComponentRequest = isComponentUrl(req);
          const maybeComponentName = getComponent(req);
          if (maybeComponentName && controllerMap[maybeComponentName]) {
            const component = controllerMap[maybeComponentName];
            const parsedComponentProps = component.requestHandler?.call(
              component,
              req,
            );
            const globalContext = {
              ...globalContextParser(req, maybeComponentName),
              ...parsedComponentProps,
            };

            void this.renderComponent(
              component.Api({
                globalContext,
                ...parsedComponentProps,
              }),
              globalContext,
            )
              .then((htmlStream) => {
                res = res.set({
                  "Transfer-Encoding": "chunked",
                  "Content-Type": "text/html",
                  //   "Content-Encoding": "gzip",
                });
                if (component.cache) {
                  res.set("cache-control", component.cache);
                }
                // allow consumers to configure the response
                // before starting streaming
                if (configResponse) {
                  res = configResponse(res);
                }
                // const gzip = zlib.createGzip();
                htmlStream
                  // .pipe(gzip)
                  .pipe(res);
              })
              .catch((err) => next(err));
          } else {
            if (maybeComponentName || isComponentRequest) {
              if (process.env.NODE_ENV === "development") {
                const err = new Error(
                  `Requested component ${
                    maybeComponentName ?? req.originalUrl
                  } could not be found. Did you add it to the middleware configuration, or decorated the component class with @Autowire?`,
                );
                const errStr = JSON.stringify(
                  err,
                  Object.getOwnPropertyNames(err),
                );
                res.status(500).send(errStr);
              } else {
                res.status(500).send(
                  JSON.stringify({
                    message: "There was an error. Please try again",
                    stack: "",
                  }),
                );
              }
              return;
            }
            next();
          }
        } catch (error) {
          next(error);
        }
      });
    };
  }

  logger(config: LoggerConfiguration): ILogger {
    return new DefaultLogger(config);
  }
}
