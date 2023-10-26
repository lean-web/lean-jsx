import { ComponentTest, ComponentHandler } from "..";
import { isClassNode } from "@/jsx/html/jsx-utils";
import { ContextManager } from "@/jsx/context/context-manager";
import { SXLGlobalContext } from "@/types/context";

export const ClassElementTest: ComponentTest<SXL.ClassElement> = (
    arg: SXL.Element
): arg is SXL.ClassElement => {
    return isClassNode(arg);
    // return !isPromise(arg) && !isAsyncGen(arg) && typeof arg.type === "string";
};
export const ClassElementHandler: ComponentHandler = (
    element: SXL.Element,
    contextManager: ContextManager<SXLGlobalContext>
) => {
    if (!ClassElementTest(element)) {
        return undefined;
    }
    const [id, ctx] = contextManager.newIdAndContext();

    const props: SXL.Props = {
        ...element.props,
        children: element.children,
        globalContext: contextManager.getGlobalContext()
    };

    const classNode = new element.type(props);
    const placeholder = contextManager.errorHandler.withErrorHandling(
        () => classNode.render(),
        {
            extraInfo: {
                classComponent: classNode.render.bind(null).name
            }
        }
    );
    const lazyElement = contextManager.errorHandler.withErrorHandling(
        () => classNode.renderLazy(),
        {
            extraInfo: {
                classComponent: classNode.renderLazy.bind(null).name
            }
        }
    );

    const {
        element: decoratedElement,
        placeholder: decoratedplaceholder,
        handlers
    } = contextManager.processElement(id, ctx, lazyElement, placeholder);
    return {
        id,
        isAsync: false,
        element: decoratedElement,
        loading: decoratedplaceholder,
        context: ctx,
        handlers
    };
};
