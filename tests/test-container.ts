import { ContextManager } from "@/jsx/context/context-manager";
import {
  JSXStack,
  JSXStackOptions,
  JSXStream,
} from "@/jsx/html/stream/jsx-stack";
import { TestLogger, ErrorHandler } from "@/server/express";
import { SXLGlobalContext } from "lean-jsx-types/lib/context";
import { getMockReq, getMockRes } from "@jest-mock/express";

export function setupTests() {
  return {
    jsxStream: <G extends SXLGlobalContext>(
      root: SXL.StaticElement,
      globalContext: G,
    ): JSXStream<G> => {
      return new JSXStream<G>(
        root,
        new ContextManager(
          getMockReq(),
          globalContext,
          new ErrorHandler(TestLogger),
        ),
        TestLogger,
      );
    },

    jsxStack: <G extends SXLGlobalContext>(
      globalContext: G,
      options?: JSXStackOptions,
    ) => {
      return new JSXStack<G>(
        TestLogger,
        new ContextManager(
          getMockReq(),
          globalContext,
          new ErrorHandler(TestLogger),
        ),
        options,
      );
    },

    contextManager: <G extends SXLGlobalContext>(
      globalContext: G,
    ): ContextManager<G> =>
      new ContextManager<G>(
        getMockReq(),
        globalContext,
        new ErrorHandler(TestLogger),
      ),

    errorHandler: () => new ErrorHandler(TestLogger),

    renderToString: async <G extends SXLGlobalContext>(
      element: SXL.StaticElement,
      globalContext?: G,
    ) => {
      const stack = new JSXStack<G>(
        TestLogger,
        new ContextManager(
          getMockReq(),
          globalContext ?? ({} as G),
          new ErrorHandler(TestLogger),
        ),
      );

      void stack.push(element);

      let first = await stack.pop();
      let all = "";

      while (first) {
        all += first;
        first = await stack.pop();
      }
      return all;
    },

    renderStackToString: async <G extends SXLGlobalContext>(
      stack: JSXStack<G>,
    ) => {
      let first = await stack.pop();
      let all = "";

      while (first) {
        all += first;
        first = await stack.pop();
      }
      return all;
    },
  };
}
