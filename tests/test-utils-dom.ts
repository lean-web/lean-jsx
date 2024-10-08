import { JSDOM } from "jsdom";
import { JSXStack } from "@/jsx/html/stream/jsx-stack";
import { setupTests } from "@tests/test-container";
import fs from "fs";
import assert from "node:assert/strict";

const scriptContent = fs.readFileSync(
  require.resolve("lean-jsx/web/sxl.js"),
  "utf-8",
);

export function stringToDom(data: string): [JSDOM, string[]] {
  const domChanges: string[] = [];
  assert.ok(scriptContent);
  const dom = new JSDOM(
    `<html>
    <script>${scriptContent}</script>
    </head>
    ${data}</html>`,
    {
      runScripts: "dangerously",
    },
  );

  dom.virtualConsole.on("error", (err) => {
    console.error(err);
    throw err;
  });

  dom.virtualConsole.on("log", function (this: unknown, err) {
    console.log(err);
  });

  return [dom, domChanges];
}

async function consumeStack(
  stack: JSXStack,
  cb: (curValue: string) => void,
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

export async function jsxToDOMTest(jsx: SXL.StaticElement) {
  const TestContainer = setupTests();
  const stream = TestContainer.jsxStack({});
  await stream.push(jsx);

  const doms: string[] = [];
  await consumeStack(stream, (data) => {
    const [dom, domChanges] = stringToDom(data);
    doms.push(domContent(dom));
    domChanges.forEach((d) => {
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
  const promise = new Promise<T>(function (resolve, reject) {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  deferred.promise = promise;
  return deferred;
}

export function domContent(dom: JSDOM): string {
  return dom.window.document.body.innerHTML.replace(/[ \n]{1,}/g, " ");
}
