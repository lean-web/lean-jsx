import { ContextManager } from "@/jsx/context/context-manager";
import { JSXStack, JSXStream } from "@/jsx/html/stream/jsx-stack";
import { TestLogger, ErrorHandler } from "@/server/express";
import { SXLGlobalContext } from "@/types/context";

export function setupTests() {
  return {
    jsxStream: <G extends SXLGlobalContext>(
      root: SXL.StaticElement,
      globalContext: G
    ): JSXStream<G> => {
      return new JSXStream<G>(
        root,
        new ContextManager(globalContext, new ErrorHandler(TestLogger)),
        TestLogger
      );
    },

    jsxStack: <G extends SXLGlobalContext>(globalContext: G) => {
      return new JSXStack<G>(
        TestLogger,
        new ContextManager(globalContext, new ErrorHandler(TestLogger))
      );
    },

    contextManager: <G extends SXLGlobalContext>(
      globalContext: G
    ): ContextManager<G> =>
      new ContextManager<G>(globalContext, new ErrorHandler(TestLogger)),
  };
}
