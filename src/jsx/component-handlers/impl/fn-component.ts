import { isPromise } from "util/types";
import { ComponentTest, ComponentHandler } from "..";
import { isAsyncGen, isFunctionNode } from "@/jsx/html/jsx-utils";
import { ContextManager } from "@/jsx/context/context-manager";
import { SXLGlobalContext } from "@/types/context";

export const FnElementTest: ComponentTest<SXL.FunctionElement> = (
    arg: SXL.Element
): arg is SXL.FunctionElement => {
    return (
        !isPromise(arg) &&
        !isAsyncGen(arg) &&
        isFunctionNode(arg) &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        !(arg.type.prototype && "next" in arg.type.prototype)
    );
};

export const FnElementHandler: ComponentHandler = (
    element: SXL.Element,
    contextManager: ContextManager<SXLGlobalContext>
) => {
    if (!FnElementTest(element)) {
        return undefined;
    }
    const [id, ctx] = contextManager.newIdAndContext();
    const props: SXL.Props = {
        ...element.props,
        children: element.children,
        globalContext: contextManager.getGlobalContext()
    };

    // const newElement = element.type.bind(ctx)(props);

    const newElement = contextManager.errorHandler.withErrorHandling(
        () => {
            return element.type.bind(ctx)(props);
        },
        {
            extraInfo: {
                componentFunction: element.type.name
            }
        }
    );

    // if (isAsyncGen(newElement)) {}

    const {
        element: decoratedElement,
        placeholder: decoratedplaceholder,
        handlers
    } = contextManager.processElement(id, ctx, newElement);
    return {
        id,
        isAsync: false,
        element: decoratedElement,
        loading: decoratedplaceholder,
        context: ctx,
        handlers
    };
};
