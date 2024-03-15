import type { ComponentTest, ComponentHandler } from "..";
import { isAsyncGenNode } from "@/jsx/html/jsx-utils";
import { ContextManager } from "@/jsx/context/context-manager";

export const AsyncGenElementTest: ComponentTest<SXL.FunctionAsyncGenElement> = (
  arg: SXL.Element,
): arg is SXL.FunctionAsyncGenElement => {
  return isAsyncGenNode(arg);
};

/**
 * Handle async-generator-based components.
 * 
 * e.g.:
 * 
 *  async function* MyComponent() {
        yield (<>Loading</>);
        await Promise.resolve();
        return <p data-hello="123">Hello</p>;
    }

    <MyComponent/>

    Note that, currently, async-gen components can only
    yield once before returning. This may change in the future.
 *
 * @param element - the element to handle.
 * @param contextManager - the context manager.
 * @returns a wrapper around the decorated element.
 */
export const AsyncGenElementHandler: ComponentHandler = (
  element: SXL.Element,
  contextManager: ContextManager,
  handlingOptions: {
    sync: boolean;
  },
) => {
  if (!AsyncGenElementTest(element)) {
    return undefined;
  }

  const [id, ctx] = contextManager.newIdAndContext();
  const props: SXL.Props = {
    ...element.props,
    children: element.children,
    globalContext: contextManager.getGlobalContext(),
  };

  const newElement = element.type.bind(ctx)(props);
  const placeholder = contextManager.errorHandler.withErrorHandling(
    () =>
      newElement.next().then((data) => {
        if (data.done || !data.value) {
          return contextManager.errorHandler.getFallback({});
        }
        return data.value;
      }),
    {
      extraInfo: {
        asyncGeneratorComponent: element.type.name,
      },
    },
  );
  const lazyElement = contextManager.errorHandler.withErrorHandling(
    () =>
      newElement.next().then((data) => {
        if (data.done && !data.value) {
          return contextManager.errorHandler.getFallback({});
        }
        return data.value;
      }),
    {
      extraInfo: {
        asyncGeneratorComponent: element.type.name,
      },
    },
  );
  return contextManager.processElement(
    id,
    ctx,
    lazyElement,
    placeholder,
    handlingOptions.sync,
  );
};
