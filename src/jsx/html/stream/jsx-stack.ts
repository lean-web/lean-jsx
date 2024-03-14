import { Readable, ReadableOptions } from "stream";
import { JSXToHTMLUtils } from "../jsx-to-html";
import {
  isTextNode,
  isClassNode,
  isFunctionNode,
  isPromise,
  isStaticNode,
  unwrapFragments,
  isAsyncGen,
  isAsyncGenNode,
} from "../jsx-utils";
import { ContextManager } from "@/jsx/context/context-manager";
import { SXLGlobalContext } from "lean-jsx-types/lib/context";
import {
  decorateContext,
  wirePlaceholder,
} from "@/jsx/context/context-decorator";
import { ILogger } from "@/jsx/logging/logger";
import { ComponentHandlerMap } from "@/jsx/component-handlers/handler-map";
import { ParsedComponent } from "@/jsx/component-handlers";
import { TrackablePromise } from "./stream-utils/trackable-promise";
import { LeanError, RenderError } from "@/jsx/degradation/errors";
import { Request } from "express";

/**
 * A utility stack used to pre-process elements outside of the main JSXStack.
 * This is used while processing asyncronous elements.
 */
class SubStack {
  doneList: string[] = [];
  inProgressStack: Array<SXL.StaticElement | string | number | boolean> = [];

  merge(another: SubStack) {
    this.doneList = [...this.doneList, ...another.doneList];
    this.inProgressStack = [
      ...this.inProgressStack,
      ...another.inProgressStack,
    ];
  }
}

export interface JSXStackOptions {
  sync: boolean;
}

const MARKERS = {
  ASYNC_START: "ASYNC_START",
  ASYNC_END: "ASYNC_END",
  END: "END",
};

type JSXStackEvents = keyof typeof MARKERS;
type JSXStackEventMap = {
  [K in JSXStackEvents]?: Array<() => void>;
};

function isEventKey(str: string): str is JSXStackEvents {
  return !!MARKERS[str];
}

/**
 * A stack-like object which receives JSX elements or literals, process them, and outputs
 * and HTML in string chunks:
 *
 * - "push" adds an element to process.
 * - "pop" gets the next process chunk.
 */
export class JSXStack<G extends SXLGlobalContext> {
  options: JSXStackOptions;
  // a list of processed HTML chunks.
  doneList: string[] = [];
  // a stack where we add elements that are yet to be processed.
  inProgressStack: Array<SXL.StaticElement | string | number | boolean> = [];
  // a map of listeners for specific events in the stack flow.
  eventListeners: JSXStackEventMap = {};
  // a list of asynchronous elements that need to be processed.
  // We remove the resolved elements as we detect their promises are fulfilled.
  asyncInProgress: Promise<void>[] = [];
  // a flag to indicate whether this stack has already started processing elements.
  started: boolean = false;

  jsQueue: string[] = [];

  private contextManager: ContextManager<G>;
  private logger: ILogger;

  constructor(
    logger: ILogger,
    contextManager: ContextManager<G>,
    options?: JSXStackOptions,
  ) {
    this.contextManager = contextManager;
    this.options = options ?? { sync: false };
    this.logger = logger;
  }

  /**
   * Add event listeners for special events within the stack.
   * @param ev - the event type
   * @param callback - the function to execute on the event.
   */
  on(ev: JSXStackEvents, callback: () => void) {
    this.eventListeners[ev] = this.eventListeners[ev] ?? [];
    this.eventListeners[ev]?.push(callback);
  }

  private fire(ev: JSXStackEvents) {
    this.eventListeners[ev]?.forEach((cb) => cb());
  }

  private async processElementInSubqueue(element: SXL.StaticElement) {
    const localStack = new SubStack();
    // TODO: Find a better place to clean fragments
    if (isStaticNode(element) && element.type === "fragment") {
      element.children
        .flatMap((child) => (Array.isArray(child) ? child : [child]))
        .reverse()
        .forEach((child) => {
          localStack.inProgressStack.push(child);
        });
      return;
    }

    if (
      isFunctionNode(element) ||
      isClassNode(element) ||
      isAsyncGenNode(element)
    ) {
      await this.push(element);
      // element to process is a constructor/function
      // we put it in the queue and return
      return;
    }

    const [open, close] = JSXToHTMLUtils.jsxNodeToHTMLTag(element);

    if (!element.props.id) {
      const error = new RenderError("Resolved async element should have an ID");
      this.logger.error(error, element.type);
      throw error;
    }

    this.logger.debug("Pushing async component");
    localStack.inProgressStack.push(MARKERS.ASYNC_END);
    localStack.inProgressStack.push(wirePlaceholder(element.props.id));
    localStack.inProgressStack.push(close);
    element.children
      .flatMap((child) => (Array.isArray(child) ? child : [child]))
      .reverse()
      .forEach((child) => {
        localStack.inProgressStack.push(child);
      });

    localStack.inProgressStack.push(open);
    localStack.inProgressStack.push(MARKERS.ASYNC_START);

    this.mergeSubstack(localStack);
  }

  private async processElement(
    element: SXL.StaticElement,
    wrap: ParsedComponent,
  ) {
    // TODO: Find a better place to clean fragments
    if (isStaticNode(element) && element.type === "fragment") {
      element.children
        .flatMap((child) => (Array.isArray(child) ? child : [child]))
        .reverse()
        .forEach((child) => this.inProgressStack.push(child));
      return;
    }

    if (isFunctionNode(element) || isClassNode(element)) {
      await this.push(element);
      // element to process is a constructor/function
      // we put it in the queue and return
      return;
    }

    const [open, close] = JSXToHTMLUtils.jsxNodeToHTMLTag(element);
    this.doneList.push(open);
    const jsCode = decorateContext(wrap);

    if (jsCode.trim().length > 0) {
      if (this.options.sync) {
        this.jsQueue.push(jsCode);
      } else {
        this.inProgressStack.push(jsCode);
      }
    }
    this.inProgressStack.push(close);
    element.children
      .flatMap((child) => (Array.isArray(child) ? child : [child]))
      .reverse()
      .forEach((child) => {
        this.inProgressStack.push(child);
      });
  }

  /**
   * Pushes an element into the stack. JSXStack will process it and:
   * - If the element is a function component, it will call the function and
   *    put the result in the in-progress stack.
   * - If the element is a class component, it will instantiate, call render
   *    methods and put the results in the in-progress stack.
   * - If the element is an instrisic/static element, it will put its children,
   *    (if any) in the in-progress stack, and put the opening tag (or the whole tag,
   *    if it's a self-closing element) in the done list.
   * - If the element is a promise and the stack is runing in async-mode:
   *    1. It will put a placeholder element in the in-progress stack
   *    2. It will add a then clause to put the resolved element in the in-progress stack.
   * - If the element is a promise and the stack is runing in sync-mode:
   *    1. It will wait for the promise to be resolved and put it in the in-progress stack.
   * - If the element is a literal, it will put it in the done list.
   *
   * @param element - the element to process.
   */
  async push(element: string | number | boolean | SXL.Element): Promise<void> {
    if (!this.started) {
      this.started = true;
      this.logger.debug(
        { sync: this.options.sync },
        "Start processing JSX element",
      );
    }
    if (typeof element === "number" || typeof element === "boolean") {
      this.doneList.push(`${element}`);
    } else if (isTextNode(element)) {
      this.doneList.push(element);
    } else if (isPromise(element)) {
      if (this.options.sync) {
        await this.push(await element);
        return;
      }

      const p = element.then((e) => {
        queueMicrotask(() => {
          const currentPromise = this.asyncInProgress.indexOf(p);
          this.asyncInProgress.splice(currentPromise, 1);
        });
        return this.processElementInSubqueue(e);
      });

      this.asyncInProgress.push(p);
    } else if (isStaticNode(element) && element.type === "fragment") {
      const children = unwrapFragments(element);
      children.reverse().forEach((child) => this.inProgressStack.push(child));
    } else if (isAsyncGen(element)) {
      // the pushed element is the result of an AsyncGen function.

      if (this.options.sync === true) {
        // ignore the first yield (loading state).
        await element.next();
        const n = await element.next();
        if (n.value) {
          await this.push(n.value);
        }
        return;
      }

      const v = this.contextManager.decorateAsyncGenResult(
        element.next().then((v) => v.value),
        element.next().then((v) => v.value),
      );
      if (v.loading && !this.options.sync) {
        await this.processElement(await v.loading, v);
      }
      if (v.element instanceof TrackablePromise) {
        await this.push(v.element.promise);
      } else {
        await this.processElement(v.element, v);
      }

      //   const asyncGenValues = [element.next(), element.next()]
      //     .map((el) =>
      //       this.contextManager.decorateAsyncGenResult(el.then((v) => v.value)),
      //     )
      //     .reverse()
      //     .map((v) => {
      //       if (v.element instanceof TrackablePromise) {
      //         return this.push(v.element.promise);
      //       }
      //       return this.processElement(v.element, v);
      //     });

      //   await Promise.all(asyncGenValues);
    } else {
      // find the correct handler for the given component type
      // e.g. function component, class component, etc:
      const wrapped = ComponentHandlerMap.map((handler) =>
        handler(element, this.contextManager, {
          sync: this.options.sync,
        }),
      ).find((el) => el);

      if (!wrapped) {
        if (isAsyncGen(element)) {
          const error = new RenderError("Unexpected async gen");

          this.logger.error(error, "");
          throw error;
        }
        const error = new RenderError(
          `Unexpected component type: ${
            typeof element.type === "string"
              ? element.type
              : element.type?.name ?? element
          }`,
        );
        this.logger.error(error, "");
        throw error;
      }

      if (wrapped.loading && !this.options.sync) {
        await this.processElement(await wrapped.loading, wrapped);
      }

      if (wrapped.element instanceof TrackablePromise) {
        await this.push(wrapped.element.promise);
      } else {
        await this.processElement(wrapped.element, wrapped);
      }
    }
  }

  private mergeSubstack(subStack: SubStack) {
    this.doneList = [...this.doneList, ...subStack.doneList];
    this.inProgressStack = [
      ...subStack.inProgressStack,
      ...this.inProgressStack,
    ];
  }

  marked = false;

  /**
   * Returns the next processed string available in the "done" list. It
   * also processes the next element in the "in-progress" stack, pushing into
   * the stack any resolved sub-elements.
   *
   * @returns the next available string, or undefined if all elements have been processed.
   */
  async pop(): Promise<string | undefined> {
    // if nothing is waiting to be processed, but
    // we have async components pending to be processed,
    // we wait for the first one to complete.
    if (this.inProgressStack.length === 0 && this.asyncInProgress.length > 0) {
      if (!this.marked) {
        this.marked = true;
        return `<!-- ASYNC -->`;
      }
      //
      await Promise.race(this.asyncInProgress);
    }

    this.marked = false;

    // get an element out of the in-progress stack
    // and push it to be processed.
    let next = this.inProgressStack.pop();
    // pop any event keys (ASYNC_START/ASYNC_END, etc) that are
    // at the top of the stack
    while (typeof next === "string" && isEventKey(next)) {
      this.fire(next);
      next = this.inProgressStack.pop();
    }
    if (next) {
      await this.push(next);
    }

    // The previous push may have found just function elements
    // that were resolved and requeued, which means doneList will be empty
    // but the inProgress stacks will have elements.
    // in this case, we pull the first completed element.
    if (
      this.doneList.length === 0 &&
      (this.inProgressStack.length > 0 || this.asyncInProgress.length > 0)
    ) {
      return await this.pop();
    }

    // get the next completed element
    const last = this.doneList.shift();
    if (!last) {
      if (this.options.sync && this.jsQueue.length > 0) {
        this.jsQueue.forEach((js) => {
          this.doneList.push(js);
        });
        this.jsQueue = [];
        return await this.pop();
      }
      this.fire("END");
      this.logger.debug("Finished processing all JSX elements in the stack");
    }
    return last;
  }
}

interface AdditionalChunks {
  pre: string[];
  post: string[];
  sync?: boolean;
}

export type JSXStreamOptions = Partial<ReadableOptions> & AdditionalChunks;

export class JSXStream<G extends SXLGlobalContext> extends Readable {
  private root: SXL.Element;
  private jsxStack: JSXStack<G>;
  private pre: string[];
  private post: string[];

  constructor(
    root: SXL.Element,
    contextManager: ContextManager<G>,
    logger: ILogger,
    options?: JSXStreamOptions,
  ) {
    super({ ...options, encoding: "utf-8" });
    this.pre = options?.pre ?? [];
    this.post = options?.post ?? [];
    this.root = root;
    this.jsxStack = new JSXStack(logger, contextManager, {
      sync: options?.sync ?? false,
    });
  }

  push(chunk: string | null, encoding?: BufferEncoding | undefined): boolean {
    // console.log(chunk);
    return super.push(chunk, encoding);
  }

  async init() {
    await this.jsxStack.push(this.root);
  }

  onFlush() {}

  _read(): void {
    if (this.pre.length) {
      const shifted = this.pre.shift();
      if (shifted) {
        this.push(shifted);
      }
      return;
    }
    void this.jsxStack
      .pop()
      .then((chunk) => {
        if (!chunk) {
          this.post.forEach((ch) => {
            this.push(ch);
          });
          this.push(null);
          return;
        }

        this.push(chunk);
      })
      .catch((err) => {
        const uuid = err instanceof LeanError ? err.uuid : "";
        this.push(`<span class="error" data-uuid="${uuid}"></span>`);
        console.error(err);
      });
  }
}

export type JSXStreamFactory<G extends SXLGlobalContext> = (
  root: SXL.Element,
  request: Request,
  globalContext: G,
  opts: JSXStreamOptions,
) => JSXStream<G>;
