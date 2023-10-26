import { Readable, ReadableOptions } from "stream";
import { JSXToHTMLUtils } from "../jsx-to-html";
import {
    isTextNode,
    isClassNode,
    isFunctionNode,
    isPromise,
    isStaticNode,
    unwrapFragments,
    isAsyncGen
} from "../jsx-utils";
import { ContextManager } from "@/jsx/context/context-manager";
import { SXLGlobalContext } from "lean-jsx/src/types/context";
import {
    decorateContext,
    wirePlaceholder
} from "@/jsx/context/context-decorator";
import { ILogger } from "@/jsx/logging/logger";
import { ComponentHandlerMap } from "@/jsx/component-handlers/handler-map";
import { ParsedComponent } from "@/jsx/component-handlers";
import { TrackablePromise } from "./stream-utils/trackable-promise";

class SubStack {
    doneList: string[] = [];
    inProgressStack: Array<SXL.StaticElement | string | number | boolean> = [];

    merge(another: SubStack) {
        this.doneList = [...this.doneList, ...another.doneList];
        this.inProgressStack = [
            ...this.inProgressStack,
            ...another.inProgressStack
        ];
    }
}

interface JSXStackOptions {
    sync: boolean;
}

const MARKERS = {
    ASYNC_START: "ASYNC_START",
    ASYNC_END: "ASYNC_END",
    END: "END"
};

type JSXStackEvents = keyof typeof MARKERS;
type JSXStackEventMap = {
    [K in JSXStackEvents]?: Array<() => void>;
};

function isEventKey(str: string): str is JSXStackEvents {
    return !!MARKERS[str];
}

export class JSXStack<G extends SXLGlobalContext> {
    options: JSXStackOptions;
    doneList: string[] = [];
    inProgressStack: Array<SXL.StaticElement | string | number | boolean> = [];
    eventListeners: JSXStackEventMap = {};
    started: boolean = false;

    asyncInProgress: Promise<void>[] = [];
    private contextManager: ContextManager<G>;
    private logger: ILogger;

    constructor(
        logger: ILogger,
        contextManager: ContextManager<G>,
        options?: JSXStackOptions
    ) {
        this.contextManager = contextManager;
        this.options = options ?? { sync: false };
        this.logger = logger;
    }

    on(ev: JSXStackEvents, callback: () => void) {
        this.eventListeners[ev] = this.eventListeners[ev] ?? [];
        this.eventListeners[ev]?.push(callback);
    }

    fire(ev: JSXStackEvents) {
        this.eventListeners[ev]?.forEach(cb => cb());
    }

    processElementInSubqueue(element: SXL.StaticElement) {
        const localStack = new SubStack();
        // TODO: Find a better place to clean fragments
        if (isStaticNode(element) && element.type === "fragment") {
            element.children
                .reverse()
                .forEach(child => localStack.inProgressStack.push(child));
            return;
        }

        const [open, close] = JSXToHTMLUtils.jsxNodeToHTMLTag(element);

        if (!element.props.id) {
            throw new Error("Resolved async element should have an ID");
        }

        this.logger.debug("Pushing async component");
        localStack.inProgressStack.push(MARKERS.ASYNC_END);
        localStack.inProgressStack.push(wirePlaceholder(element.props.id));
        localStack.inProgressStack.push(close);
        element.children.reverse().forEach(child => {
            localStack.inProgressStack.push(child);
        });

        localStack.inProgressStack.push(open);
        localStack.inProgressStack.push(MARKERS.ASYNC_START);

        this.mergeSubstack(localStack);
    }

    async processElement(element: SXL.StaticElement, wrap: ParsedComponent) {
        // TODO: Find a better place to clean fragments
        if (isStaticNode(element) && element.type === "fragment") {
            element.children
                .reverse()
                .forEach(child => this.inProgressStack.push(child));
            return;
        }

        if (isFunctionNode(element) || isClassNode(element)) {
            await this.push(element);
            // this.doneList.push("REQUEUED");
            return;
        }

        const [open, close] = JSXToHTMLUtils.jsxNodeToHTMLTag(element);
        this.doneList.push(open);
        const jsCode = decorateContext(wrap);
        if (jsCode.trim().length > 0) {
            this.inProgressStack.push(jsCode);
        }
        this.inProgressStack.push(close);
        element.children.reverse().forEach(child => {
            this.inProgressStack.push(child);
        });
    }

    async push(
        element: string | number | boolean | SXL.Element | SXL.AsyncElement
    ) {
        if (!this.started) {
            this.started = true;
            this.logger.debug(
                { sync: this.options.sync },
                "Start processing JSX element"
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

            const p = element.then(e => {
                queueMicrotask(() => {
                    const currentPromise = this.asyncInProgress.indexOf(p);
                    this.asyncInProgress.splice(currentPromise, 1);
                });
                this.processElementInSubqueue(e);
            });

            this.asyncInProgress.push(p);
        } else if (isStaticNode(element) && element.type === "fragment") {
            const children = unwrapFragments(element);
            children
                .reverse()
                .forEach(child => this.inProgressStack.push(child));
        } else if (isAsyncGen(element)) {
            // TODO
            throw new Error("Not implemented");
        } else {
            // const wrapped = this.wrap(element);
            const wrapped = ComponentHandlerMap.map(handler =>
                handler(element, this.contextManager)
            ).find(el => el);

            if (!wrapped) {
                // TODO:
                throw new Error("Not implemented");
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

    mergeSubstack(subStack: SubStack) {
        this.doneList = [...this.doneList, ...subStack.doneList];
        this.inProgressStack = [
            ...subStack.inProgressStack,
            ...this.inProgressStack
        ];
    }

    async pop(): Promise<string | undefined> {
        if (
            this.inProgressStack.length === 0 &&
            this.asyncInProgress.length > 0
        ) {
            await Promise.race(this.asyncInProgress);
        }

        let next = this.inProgressStack.pop();
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
        if (
            this.doneList.length === 0 &&
            (this.inProgressStack.length > 0 || this.asyncInProgress.length > 0)
        ) {
            return await this.pop();
        }

        const last = this.doneList.shift();
        if (!last) {
            this.fire("END");
            this.logger.debug(
                "Finished processing all JSX elements in the stack"
            );
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
    private beforeEndHandler?: (stream: JSXStream<G>) => void;

    constructor(
        root: SXL.Element,
        contextManager: ContextManager<G>,
        logger: ILogger,
        options?: JSXStreamOptions
    ) {
        super({ ...options, encoding: "utf-8" });
        this.pre = options?.pre ?? [];
        this.post = options?.post ?? [];
        this.root = root;
        this.jsxStack = new JSXStack(logger, contextManager, {
            sync: options?.sync ?? false
        });
    }

    beforeEnd(handler: (stream: JSXStream<G>) => void) {
        this.beforeEndHandler = handler;
    }

    async init() {
        await this.jsxStack.push(this.root);
    }

    // push(chunk: string | null, encoding?: BufferEncoding | undefined): boolean {
    //     // this.logger.debug({ chunk }, "Push...");
    //     return this.push(chunk, encoding);
    // }

    onFlush() {}

    _read(): void {
        if (this.pre.length) {
            const shifted = this.pre.shift();
            if (shifted) {
                this.push(shifted);
            }
            return;
        }
        void this.jsxStack.pop().then(chunk => {
            if (!chunk) {
                this.post.forEach(ch => {
                    this.push(ch);
                });
                // if (this.beforeEndHandler) {
                //     this.beforeEndHandler(this);
                // }
                this.push(null);
                return;
            }

            this.push(chunk);
        });
    }
}

export type JSXStreamFactory<G extends SXLGlobalContext> = (
    root: SXL.Element,
    globalContext: G,
    opts: JSXStreamOptions
) => JSXStream<G>;
