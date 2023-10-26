import { isPromise, unwrapFragments } from "../html/jsx-utils";
import { UIDGenerator } from "../html/uuid";
import { TrackablePromise } from "../html/stream/stream-utils/trackable-promise";
import { SXLGlobalContext } from "lean-jsx/src/types/context";
import { IErrorHandler } from "../degradation/error-handler";

interface SyncJSXWrapper {
    id: ContextID;
    element: SXL.StaticElement;
    placeholder: undefined;
    handlers: Array<HandlerPropAndValue>;
    context: SXL.Context<Record<string, unknown>>;
}

interface AsyncJSXWrapper {
    id: ContextID;
    element: TrackablePromise<SXL.StaticElement, unknown>;
    placeholder: SXL.StaticElement;
    handlers: Array<HandlerPropAndValue>;
    context: SXL.Context<Record<string, unknown>>;
}

interface AsyncGenJSXWrapper {
    id: ContextID;
    element: TrackablePromise<SXL.StaticElement, unknown>;
    placeholder: SXL.AsyncElement;
    handlers: Array<HandlerPropAndValue>;
    context: SXL.Context<Record<string, unknown>>;
}

export type SXLElementWithContext =
    | SyncJSXWrapper
    | AsyncJSXWrapper
    | AsyncGenJSXWrapper;

export function isAsyncElementWithContext(
    element: SXLElementWithContext
): element is AsyncJSXWrapper {
    return (
        element.element instanceof TrackablePromise ||
        isPromise(element.element)
    );
}

export function isAsyncGenElementWithContext(
    element: SXLElementWithContext
): element is AsyncGenJSXWrapper {
    return (
        (element.element instanceof TrackablePromise ||
            isPromise(element.element)) &&
        isPromise(element.placeholder)
    );
}

export type ContextID = string;

type HandlerPropAndValue = [string, string];

export class LocalContext implements SXL.Context<Record<string, unknown>> {
    [x: string]: unknown;
}

export interface ContextManagerOptions {
    sync: boolean;
}

export class ContextManager<G extends SXLGlobalContext> {
    private options: ContextManagerOptions;
    errorHandler: IErrorHandler;
    private uiden = UIDGenerator.new();
    private globalContext: G;

    constructor(
        globalContext: G,
        errorHandler: IErrorHandler,
        options?: ContextManagerOptions
    ) {
        this.globalContext = globalContext;
        this.options = options ?? { sync: false };
        this.errorHandler = errorHandler;
    }

    newIdAndContext(): [ContextID, SXL.Context<Record<string, unknown>>] {
        return [this.uiden(), this.newContext()];
    }

    newContext(): SXL.Context<Record<string, unknown>> {
        return new LocalContext();
    }

    getGlobalContext(): G {
        return this.globalContext;
    }

    processElement(
        id: ContextID,
        context: SXL.Context<Record<string, unknown>>,
        element: SXL.StaticElement | SXL.AsyncElement,
        placeholder?: SXL.StaticElement | SXL.AsyncElement
    ): SXLElementWithContext {
        if (isPromise(element)) {
            return {
                id,
                element: new TrackablePromise(
                    element.then(e => {
                        if (!e) {
                            console.trace(
                                `Failed to decorated async element`,
                                element
                            );
                            return this.errorHandler.getFallback({});
                        }
                        // if operating in sync mode,
                        // we don't need to wrap the async element
                        // in a template
                        if (this.options.sync) {
                            return e;
                        }
                        if (!e.props.dataset) {
                            e.props.dataset = {};
                        }
                        return {
                            type: "template",
                            props: {
                                id
                            },
                            children: unwrapFragments(e)
                        };
                    }),
                    id
                ),
                placeholder: isPromise(placeholder)
                    ? placeholder?.then(p => this.processPlaceholder(id, p))
                    : this.processPlaceholder(id, placeholder),
                handlers: [],
                context
            };
        }

        return {
            id,
            element,
            placeholder: undefined,
            handlers: this.processHandlers(id, element),
            context
        };
    }

    processHandlers(
        id: ContextID,
        element: SXL.StaticElement
    ): Array<HandlerPropAndValue> {
        const handlers: Array<[string, unknown]> = Object.entries(
            element.props
        ).filter(([key, v]) => /^on/.test(key) || typeof v === "function");

        const _handlers: Array<HandlerPropAndValue> = [];

        handlers.forEach(([key, v]) => {
            let handlerContent = "";
            if (typeof v === "function") {
                handlerContent = v.toString();
            } else if (typeof v === "string") {
                handlerContent = v;
            }
            element.props[key] = "";
            _handlers.push([key as keyof GlobalEventHandlers, handlerContent]);
        });

        if (_handlers.length) {
            element.props.dataset = element.props.dataset ?? {};
            element.props.dataset["data-action"] = id;
        }

        return _handlers;
    }

    private processPlaceholder(
        id: ContextID,
        placehoder?: SXL.StaticElement
    ): SXL.StaticElement {
        return {
            type: "div",
            props: {
                dataset: {
                    ["data-placeholder"]: id
                }
            },
            children: placehoder ? unwrapFragments(placehoder) : []
        };
    }
}

export type ContextManagerFactory<G extends SXLGlobalContext> = (
    globalContext: G
) => ContextManager<G>;
