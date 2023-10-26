import { JSDOM } from "jsdom";
import { fillPlaceHolder as fp } from "@/web/wiring";
import { JSXStack } from "@/jsx/html/stream/jsx-stack";
import { SXLGlobalContext } from "@/types/context";
import { setupTests } from "@tests/test-container";

export function stringToDom(data: string): [JSDOM, string[]] {
    const domChanges: string[] = [];
    const dom = new JSDOM(
        `<html>
    <head></head>
    ${data}</html>`,
        {
            runScripts: "dangerously",
            beforeParse(window) {
                const document = window.document;
                globalThis.document = document;
                window.sxl = {
                    fillPlaceHolder(placeHolderId: string) {
                        fp.call({ document }, placeHolderId);
                        domChanges.push(
                            window.document.body.innerHTML.replace(
                                /[ \n]{1,}/g,
                                " "
                            )
                        );
                    }
                };
            }
        }
    );

    dom.virtualConsole.on("error", err => {
        console.error(err);
        throw err;
    });

    dom.virtualConsole.on("log", function(this: unknown, err) {
        console.log(err);
    });

    return [dom, domChanges];
}

async function consumeStack(
    stack: JSXStack<SXLGlobalContext>,
    cb: (curValue: string) => void
): Promise<string> {
    let first = await stack.pop();
    let all = "";

    stack.on("ASYNC_START", () => {
        cb(all);
    });

    stack.on("ASYNC_END", () => {
        cb(all);
    });

    stack.on("END", () => {
        queueMicrotask(() => {
            cb(all);
        });
    });

    while (first) {
        all += first;
        first = await stack.pop();
    }
    return all;
}

export async function jsxToDOMTest(jsx: SXL.Element) {
    const TestContainer = setupTests();
    const stream = TestContainer.jsxStack<object>({});
    await stream.push(jsx);

    const doms: string[] = [];
    await consumeStack(stream, data => {
        const [dom, domChanges] = stringToDom(data);
        doms.push(domContent(dom));
        domChanges.forEach(d => {
            doms.push(d);
        });
    });

    return doms;
}

export interface Deferred<T> {
    resolve: (arg: T | PromiseLike<T>) => void;
    reject: (reason?: unknown) => void;
    promise: Promise<T>;
}

export function defer<T>(): Deferred<T> {
    const deferred = {} as Deferred<T>;
    const promise = new Promise<T>(function(resolve, reject) {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    deferred.promise = promise;
    return deferred;
}

export function domContent(dom: JSDOM): string {
    return dom.window.document.body.innerHTML.replace(/[ \n]{1,}/g, " ");
}
