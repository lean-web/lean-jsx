import { isPromise } from "util/types";
import { ComponentTest, ComponentHandler, ParsedComponent } from "..";
import { isAsyncGen } from "@/jsx/html/jsx-utils";
import { ContextManager } from "@/jsx/context/context-manager";
import { SXLGlobalContext } from "@/types/context";

export const StaticElementTest: ComponentTest<SXL.IntrinsicElement> = (
    arg: SXL.Element
): arg is SXL.IntrinsicElement => {
    return !isPromise(arg) && !isAsyncGen(arg) && typeof arg.type === "string";
};
export const StaticElementHandler: ComponentHandler = (
    element: SXL.Element,
    contextManager: ContextManager<SXLGlobalContext>
) => {
    if (!StaticElementTest(element)) {
        return undefined;
    }

    const [id, ctx] = contextManager.newIdAndContext();

    const {
        element: decoratedElement,
        handlers
    } = contextManager.processElement(id, ctx, element);
    return {
        id,
        isAsync: false,
        element: decoratedElement,
        context: ctx,
        handlers
    };
};

export function staticHandler<G extends SXLGlobalContext>(
    arg: SXL.Element,
    contextManager: ContextManager<G>
): ParsedComponent | undefined {
    if (StaticElementTest(arg)) {
        return StaticElementHandler(arg, contextManager);
    }
}
