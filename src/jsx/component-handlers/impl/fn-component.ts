import { isPromise } from "util/types";
import { ComponentTest, ComponentHandler } from "..";
import { isAsyncGen, isFunctionNode } from "@/jsx/html/jsx-utils";
import { ContextManager } from "@/jsx/context/context-manager";
import { type SXLGlobalContext } from "lean-jsx-types/context";

export const FnElementTest: ComponentTest<SXL.FunctionElement> = (
  arg: SXL.Element,
): arg is SXL.FunctionElement => {
  return (
    !isPromise(arg) &&
    !isAsyncGen(arg) &&
    isFunctionNode(arg) &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    !(arg.type.prototype && "next" in arg.type.prototype)
  );
};

/**
 * Handle function JSX components. The functions can be async (return Promise<JSX.Element>)
 *
 * e.g:
 * function MyComponent() {
 *  return <div>My content</div>;
 * }
 *
 * <MyComponent/>
 *
 * async function MyAsyncComponent() {
 *  await someting();
 *  return <div>My content</div>;
 * }
 *
 * <MyAsyncComponent/>
 *
 * @param element - the element to handle.
 * @param contextManager - the context manager.
 * @returns a wrapper around the decorated element.
 */
export const FnElementHandler: ComponentHandler = (
  element: SXL.Element,
  contextManager: ContextManager<SXLGlobalContext>,
  handlingOptions: {
    sync: boolean;
  },
) => {
  if (!FnElementTest(element)) {
    return undefined;
  }
  const [id, ctx] = contextManager.newIdAndContext();
  const props: SXL.Props = {
    ...element.props,
    children: element.children,
    globalContext: contextManager.getGlobalContext(),
  };

  const newElement = contextManager.errorHandler.withErrorHandling(
    () => {
      return element.type.bind(ctx)(props);
    },
    {
      extraInfo: {
        componentFunction: element.type.name,
      },
    },
  );

  return contextManager.processElement(
    id,
    ctx,
    newElement,
    undefined,
    handlingOptions.sync,
  );
};
