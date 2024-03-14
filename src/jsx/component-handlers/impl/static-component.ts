import { isPromise } from "util/types";
import type { ComponentTest, ComponentHandler, ParsedComponent } from "..";
import { isAsyncGen } from "@/jsx/html/jsx-utils";
import { ContextManager } from "@/jsx/context/context-manager";
import type { SXLGlobalContext } from "lean-jsx-types/context";

export const StaticElementTest: ComponentTest<SXL.IntrinsicElement> = (
  arg: SXL.Element,
): arg is SXL.IntrinsicElement => {
  return !isPromise(arg) && !isAsyncGen(arg) && typeof arg.type === "string";
};
/**
 * Handle static (intrinsic) JSX elements.
 *
 * e.g. <p>Hello</p>, <button>Click</button>
 *
 * @param element - the element to handle.
 * @param contextManager - the context manager.
 * @returns a wrapper around the decorated element.
 */
export const StaticElementHandler: ComponentHandler = (
  element: SXL.Element,
  contextManager: ContextManager<SXLGlobalContext>,
  _handlingOptions: {
    sync: boolean;
  },
) => {
  if (!StaticElementTest(element)) {
    return undefined;
  }

  const [id, ctx] = contextManager.newIdAndContext();

  return contextManager.processElement(id, ctx, element);
};

export function staticHandler<G extends SXLGlobalContext>(
  arg: SXL.Element,
  contextManager: ContextManager<G>,
  handlingOptions: {
    sync: boolean;
  },
): ParsedComponent | undefined {
  if (StaticElementTest(arg)) {
    return StaticElementHandler(arg, contextManager, handlingOptions);
  }
}
