import { ComponentTest, ComponentHandler } from "..";
import { isClassNode } from "@/jsx/html/jsx-utils";
import { ContextManager } from "@/jsx/context/context-manager";
import { SXLGlobalContext } from "lean-jsx-types/lib/context";

export const ClassElementTest: ComponentTest<SXL.ClassElement> = (
  arg: SXL.Element,
): arg is SXL.ClassElement => {
  return isClassNode(arg);
  // return !isPromise(arg) && !isAsyncGen(arg) && typeof arg.type === "string";
};

/**
 * Handle class components.
 *
 * @param element - the element to handle.
 * @param contextManager - the context manager.
 * @returns a wrapper around the decorated element.
 */
export const ClassElementHandler: ComponentHandler = (
  element: SXL.Element,
  contextManager: ContextManager<SXLGlobalContext>,
) => {
  if (!ClassElementTest(element)) {
    return undefined;
  }
  const [id] = contextManager.newIdAndContext();

  const globalContext = contextManager.getGlobalContext();
  const props: SXL.Props = {
    ...element.props,
    children: element.children,
    globalContext,
  };

  const classNode = new element.type(props);
  const classContext = { ...classNode };

  let placeholder: SXL.StaticElement | undefined;

  // check for "onLoading" hook
  if (classNode.onLoading) {
    const onLoadingFn = classNode.onLoading.bind(classNode);

    placeholder = contextManager.errorHandler.withErrorHandling(
      () => onLoadingFn(),
      {
        extraInfo: {
          classComponent: onLoadingFn.name,
        },
      },
    );
  }
  const render = classNode.render.bind(classNode);
  const lazyElement = contextManager.errorHandler.withErrorHandling(
    () => render(),
    {
      extraInfo: {
        classComponent: render.name,
      },
    },
  );

  return contextManager.processElement(
    id,
    classContext,
    lazyElement,
    placeholder,
  );
};
