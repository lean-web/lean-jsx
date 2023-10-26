import { ContextID, ContextManager } from "@/jsx/context/context-manager";
import { TrackablePromise } from "@/jsx/html/stream/stream-utils/trackable-promise";
import { SXLGlobalContext } from "@/types/context";

export type HandlerPropAndValue = [string, string];

export type ComponentTest<E extends SXL.ComponentElementUnion> = (
    arg: SXL.Element
) => arg is E;

export type ComponentHandler = (
    arg: SXL.Element,
    contextManager: ContextManager<SXLGlobalContext>
) => ParsedComponent | undefined;

export interface ParsedComponent {
    id: ContextID;
    isAsync: boolean;
    loading?: SXL.StaticElement | SXL.AsyncElement;
    error?: SXL.StaticElement;
    element: SXL.StaticElement | TrackablePromise<SXL.StaticElement, unknown>;
    handlers: Array<HandlerPropAndValue>;
    context: SXL.Context<Record<string, unknown>>;
}

export type ExtractE<T> = T extends ComponentTest<infer E> ? E : never;
