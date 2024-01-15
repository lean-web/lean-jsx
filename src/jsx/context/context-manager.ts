import { isPromise, unwrapFragments } from "../html/jsx-utils";
import { UIDGenerator } from "../html/uuid";
import { TrackablePromise } from "../html/stream/stream-utils/trackable-promise";
import { SXLGlobalContext } from "lean-jsx-types/lib/context";
import { IErrorHandler } from "../degradation/error-handler";
import { ParsedComponent } from "../component-handlers";
import { isPureActionHandler, isWebHandler } from "lean-web-utils/lib/server";

interface SyncJSXWrapper {
  id: ContextID;
  element: SXL.StaticElement;
  loading: undefined;
  handlers: Array<HandlerPropAndValue>;
  context: SXL.Context<Record<string, unknown>>;
}

interface AsyncJSXWrapper {
  id: ContextID;
  element: TrackablePromise<SXL.StaticElement, unknown>;
  loading: SXL.StaticElement;
  handlers: Array<HandlerPropAndValue>;
  context: SXL.Context<Record<string, unknown>>;
}

interface AsyncGenJSXWrapper {
  id: ContextID;
  element: TrackablePromise<SXL.StaticElement, unknown>;
  loading: SXL.AsyncElement;
  handlers: Array<HandlerPropAndValue>;
  context: SXL.Context<Record<string, unknown>>;
}

export type SXLElementWithContext =
  | SyncJSXWrapper
  | AsyncJSXWrapper
  | AsyncGenJSXWrapper;

export function isAsyncElementWithContext(
  element: SXLElementWithContext,
): element is AsyncJSXWrapper {
  return (
    element.element instanceof TrackablePromise || isPromise(element.element)
  );
}

export function isAsyncGenElementWithContext(
  element: SXLElementWithContext,
): element is AsyncGenJSXWrapper {
  return (
    (element.element instanceof TrackablePromise ||
      isPromise(element.element)) &&
    isPromise(element.loading)
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

function buildWebContextString(data: Record<string, unknown>) {
  return JSON.stringify(data);
}

export class ContextManager<G extends SXLGlobalContext> {
  private options: ContextManagerOptions;
  errorHandler: IErrorHandler;
  private uiden = UIDGenerator.new();
  private globalContext: G;

  constructor(
    globalContext: G,
    errorHandler: IErrorHandler,
    options?: ContextManagerOptions,
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

  decorateAsyncGenResult(loading: SXL.AsyncElement, element: SXL.AsyncElement) {
    const [id, ctx] = this.newIdAndContext();
    return this.processElement(id, ctx, element, loading);
  }

  processElement(
    id: ContextID,
    context: SXL.Context<Record<string, unknown>>,
    element: SXL.StaticElement | SXL.AsyncElement,
    placeholder?: SXL.StaticElement | SXL.AsyncElement,
    processSync = false,
  ): ParsedComponent {
    if (isPromise(element)) {
      return {
        id,
        element: new TrackablePromise(
          element.then((e) => {
            if (!e) {
              console.trace(`Failed to decorate async element`, element);
              return this.errorHandler.getFallback({});
            }
            // if operating in sync mode,
            // we don't need to wrap the async element
            // in a template
            if (this.options.sync || processSync) {
              return e;
            }
            if (!e.props.dataset) {
              e.props.dataset = {};
            }
            return {
              type: "template",
              props: {
                id,
              },
              componentType: "string",
              children: unwrapFragments(e),
            };
          }),
          id,
        ),
        loading: isPromise(placeholder)
          ? placeholder?.then((p) => this.processPlaceholder(id, p))
          : this.processPlaceholder(id, placeholder),
        handlers: [],
        context,
      };
    }

    const handlers = this.processHandlers(id, element);

    return {
      id,
      element,
      loading: undefined,
      handlers,
      context,
    };
  }

  processHandlers(
    id: ContextID,
    element: SXL.StaticElement,
  ): Array<HandlerPropAndValue> {
    const _handlers: Array<HandlerPropAndValue> = [];

    // handle web actions with data:
    Object.entries(element.props)
      .filter(isWebHandler)
      .forEach(([key, v]) => {
        let handlerContent: string = "";
        if (typeof v === "function") {
          handlerContent += `sxl.actionHandler(${v.toString()}, {})`;
        } else {
          handlerContent += `sxl.actionHandler(${v.handler.toString()}, ${buildWebContextString(
            v.data,
          )})`;
        }

        element.props[key] = "";
        _handlers.push([key as keyof GlobalEventHandlers, handlerContent]);
      });

    // handle pure-function handlers:
    Object.entries(element.props)
      .filter(isPureActionHandler)
      .forEach(([key, v]) => {
        const handlerContent = v.toString();
        element.props[key as string] = "";
        _handlers.push([key, handlerContent]);
      });

    if (_handlers.length) {
      element.props.dataset = element.props.dataset ?? {};
      element.props.dataset["data-action"] = id;
    }

    return _handlers;
  }

  private processPlaceholder(
    id: ContextID,
    placehoder?: SXL.StaticElement,
  ): SXL.StaticElement {
    return {
      type: "div",
      props: {
        dataset: {
          ["data-placeholder"]: id,
        },
      },
      componentType: "string",
      children: placehoder ? unwrapFragments(placehoder) : [],
    };
  }
}

export type ContextManagerFactory<G extends SXLGlobalContext> = (
  globalContext: G,
) => ContextManager<G>;
