/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContextManager } from "@/jsx/context/context-manager";
import { JSXStack, JSXStream } from "@/jsx/html/stream/jsx-stack";
import { ILogger, LoggerConfiguration } from "@/jsx/logging/logger";
import { DefaultLogger, ErrorHandler } from "@/server/express";
import { SXLGlobalContext } from "@/types/context";

type ConstructorArgs<T> = T extends new (...arg: (infer U)[]) => object
    ? U
    : never;

export function Singleton<T extends new (...arg: any[]) => object>(
    ClassConstructor: T
): T {
    let instance: object;

    // A Proxy is used to intercept 'new' operator calls
    return new Proxy<T>(ClassConstructor, {
        construct(target, arg: ConstructorArgs<T>, _newTarget) {
            if (!instance) {
                instance = new ClassConstructor(arg);
            }
            return instance;
        }
    });
}

export function setupTests() {
    function getTestLogger(conf?: LoggerConfiguration): ILogger {
        // jest.mock("pino");
        const logC = Singleton(DefaultLogger);

        return new logC({
            defaultLogLevel: conf?.defaultLogLevel ?? "silent"
        });
    }

    return {
        jsxStream: <G extends SXLGlobalContext>(
            root: SXL.Element,
            globalContext: G,
            options?: LoggerConfiguration
        ): JSXStream<G> => {
            const testLogger = getTestLogger(options);
            return new JSXStream<G>(
                root,
                new ContextManager(globalContext, new ErrorHandler(testLogger)),
                testLogger
            );
        },

        jsxStack: <G extends SXLGlobalContext>(
            globalContext: G,
            options?: LoggerConfiguration
        ) => {
            const testLogger = getTestLogger(options);

            return new JSXStack<G>(
                getTestLogger(options),
                new ContextManager(globalContext, new ErrorHandler(testLogger))
            );
        },

        contextManager: <G extends SXLGlobalContext>(
            globalContext: G
        ): ContextManager<G> =>
            new ContextManager<G>(
                globalContext,
                new ErrorHandler(getTestLogger())
            )
    };
}
