import { isAsyncGen, isPromise } from "../html/jsx-utils";
import { type ILogger } from "../logging/logger";
import { getDefaultErrorComponent } from "./default-content";

type ErrorType = "Custom" | "TemplateError" | "AsyncComponent" | "Component";

export interface ErrorHandlerOptions {
  timesRetried?: number;
  extraInfo?: object;
}

export interface IErrorHandler {
  getFallback(context: Record<string, unknown>): SXL.StaticElement;
  reportError(errorType: ErrorType, err: Error): void;
  reportWarning(msg: string): void;
  withErrorHandling<T extends SXL.Element>(
    handler: () => T,
    { timesRetried, extraInfo }: ErrorHandlerOptions,
  ): T;
}

export class ErrorHandler implements IErrorHandler {
  logger: ILogger;
  // TODO: Evaluate a way to retry on error
  retries: number = 0;

  constructor(logger: ILogger) {
    this.logger = logger;
  }
  reportWarning(msg: string): void {
    this.logger.warn(msg);
  }

  getFallback(_context: Record<string, unknown>): SXL.StaticElement {
    return getDefaultErrorComponent();
  }

  withErrorHandling<T extends SXL.Element>(
    handler: () => T,
    { timesRetried, extraInfo }: ErrorHandlerOptions,
  ): T {
    try {
      const newElement = handler();
      if (!newElement) {
        console.error("unreachable!");
      }
      if (isPromise(newElement)) {
        return newElement.catch((err) => {
          this.reportError("AsyncComponent", err, extraInfo);
          return this.getFallback({});
        }) as T;
      }
      if (isAsyncGen(newElement)) {
        return newElement;
      }
      return newElement;
    } catch (err) {
      const retried = timesRetried ?? 0;
      if (retried < this.retries) {
        return this.withErrorHandling(handler, {
          timesRetried: retried + 1,
          extraInfo,
        });
      }
      this.reportError("Component", err, extraInfo);
      return this.getFallback({}) as T;
    }
  }

  intoError(err: unknown): Error {
    if (!err) {
      return new Error("Empty error");
    }
    if (err instanceof Error) {
      return err;
    }
    switch (typeof err) {
      case "string":
        return new Error(err);
      case "object":
        return new Error(JSON.stringify(err));
      default:
        return new Error("Unsupported error type");
    }
  }

  reportError(errorType: ErrorType, err: unknown, args?: object) {
    this.logger.error(this.intoError(err), { errorType, ...args });
  }
}
