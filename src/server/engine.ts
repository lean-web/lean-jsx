
import type { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import { SXLGlobalContext } from "lean-jsx/src/types/context";
import { ExpressMiddleware, LeanJSX, RenderWithTemplateOptions, SXLMiddlewareOptions } from "./api";
import { Readable } from "stream";
import { TemplateManager } from "@/jsx/html/template-manager";
import { JSXStreamFactory } from "@/jsx/html/stream/jsx-stack";
import pinoHttp from 'pino-http'
import { DefaultLogger, ILogger, LoggerConfiguration, getPinoTransports } from "@/jsx/logging/logger";
import fs from 'fs'
import path from 'path'

/**
 * Try to retrieve a DynamicComponent's name out of the URL.
 * If it exists, we can handle it directly from the middleware
 * @param req 
 * @returns 
 */
function getComponent(req: Request): string | undefined {
    const [_, component] =
        req.originalUrl.match(/\/components\/([\w-]+)/) ?? [];
    return component;
}


export class LeanAppEngine<G extends SXLGlobalContext> implements LeanJSX<G>{
    private templateManager: TemplateManager;
    private jsxStreamFactory: JSXStreamFactory<G>

    constructor(templateManager: TemplateManager, jsxStreamFactory:JSXStreamFactory<G>) {
        this.templateManager = templateManager;
        this.jsxStreamFactory = jsxStreamFactory;
    }


    async renderWithTemplate(res: Response, element: SXL.Element, globalContext: G, options: RenderWithTemplateOptions, next?: NextFunction | undefined): Promise<void> {
        try {
            const [head, tail] = this.templateManager.getHeadAndTail(options.templateName)

            const appHtmlStream = this.jsxStreamFactory(element, globalContext, {
                pre:[head],
                post:[tail],
                sync: options.sync ?? false,
            })

            await appHtmlStream.init();

             appHtmlStream.pipe(
                res.status(200).set({ "Content-Type": "text/html" })
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

   
    async renderComponent(component: SXL.Element, globalContext: G): Promise<Readable> {
        const stream = this.jsxStreamFactory(component, globalContext, {
            pre:[],
            post:[],
            sync: true,
        })
        await stream.init();
        return stream;
    }

    expressLogging(config:LoggerConfiguration): ExpressMiddleware {
        Object.values(config.file ?? {}).forEach((fileConfig) => {
            const logDir = path.dirname(fileConfig.destination);
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, {recursive:true})
            }
        })
        return pinoHttp({transport: {targets:getPinoTransports(config)}}, )
    }

    middleware(options: SXLMiddlewareOptions<G>): ExpressMiddleware {
        const bodyParserMid = bodyParser.urlencoded({ extended: true });
        // Define middleware function
        const controllerMap = Object.fromEntries(
            options.components.map((controller) => [
                controller.contentId,
                controller,
            ])
        );

        const {configResponse, globalContextParser} = options;

        return (req: Request, res: Response, next: NextFunction) => {
            bodyParserMid(req, res, (err) => {
                if (err) {
                    return next(err);
                }
                try {
                    const globalContext = globalContextParser(req);
                    const maybeComponentName = getComponent(req);

                    if (maybeComponentName && controllerMap[maybeComponentName]) {
                        void this.renderComponent(
                            controllerMap[maybeComponentName].Api({
                                globalContext,
                            }),
                            globalContext
                        )
                            .then((htmlStream) => {
                                // allow consumers to configure the response
                                // before starting streaming
                                if (configResponse) {
                                    res = configResponse(res)
                                }
                                htmlStream.pipe(res);
                            })
                            .catch((err) => next(err));
                    } else {
                        next();
                    }
                } catch (error) {
                    next(error);
                }
            });
        };
    }

    logger(config:LoggerConfiguration):ILogger {
        return new DefaultLogger(config)
    }

}