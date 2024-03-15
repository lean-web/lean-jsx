import { ContextManager } from "@/jsx/context/context-manager";
import {
  JSXStack,
  type JSXStackOptions,
  JSXStream,
} from "@/jsx/html/stream/jsx-stack";
import { TestLogger, ErrorHandler } from "@/server/express";
import type { SXLGlobalContext } from "lean-jsx-types/context";
import { getMockReq } from "@jest-mock/express";

export function setupTests() {
  return {
    jsxStream: (
      root: SXL.StaticElement,
      globalContext: SXLGlobalContext,
    ): JSXStream => {
      return new JSXStream(
        root,
        new ContextManager(
          getMockReq(),
          globalContext,
          new ErrorHandler(TestLogger),
        ),
        TestLogger,
      );
    },

    jsxStack: (globalContext: SXLGlobalContext, options?: JSXStackOptions) => {
      return new JSXStack(
        TestLogger,
        new ContextManager(
          getMockReq(),
          globalContext,
          new ErrorHandler(TestLogger),
        ),
        options,
      );
    },

    contextManager: (globalContext: SXLGlobalContext): ContextManager =>
      new ContextManager(
        getMockReq(),
        globalContext,
        new ErrorHandler(TestLogger),
      ),

    errorHandler: () => new ErrorHandler(TestLogger),

    renderToString: async (
      element: SXL.StaticElement,
      globalContext?: SXLGlobalContext,
    ) => {
      const stack = new JSXStack(
        TestLogger,
        new ContextManager(
          getMockReq(),
          globalContext ?? ({} as SXLGlobalContext),
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

    renderStackToString: async (stack: JSXStack) => {
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
