import type { ContextID, ContextManager } from "@/jsx/context/context-manager";
import { TrackablePromise } from "@/jsx/html/stream/stream-utils/trackable-promise";

export type HandlerPropAndValue = [string, string];

export type ComponentTest<E extends SXL.ComponentElementUnion> = (
  arg: SXL.Element,
) => arg is E;

export type ComponentHandler = (
  arg: SXL.Element,
  contextManager: ContextManager,
  handlingOptions: {
    sync: boolean;
  },
) => ParsedComponent | undefined;

export interface ParsedComponent {
  id: ContextID;
  loading?: SXL.StaticElement | SXL.AsyncElement;
  error?: SXL.StaticElement;
  element: SXL.StaticElement | TrackablePromise<SXL.StaticElement, unknown>;
  handlers: Array<HandlerPropAndValue>;
  context: SXL.Context<Record<string, unknown>>;
}

export type ExtractE<T> = T extends ComponentTest<infer E> ? E : never;
