import {
  JSXStreamFactory,
  JSXStreamOptions,
  JSXStream,
} from "@/jsx/html/stream/jsx-stack";
import { readableToString } from "@/jsx/html/stream/stream-utils/readable-to-string";
import { LeanAppEngine, getComponent } from "@/server/engine";
import { TemplateManager, TestLogger } from "@/server/express";
import { SXLGlobalContext } from "@/types/context";
import { describe, expect, test } from "@jest/globals";
import { DynamicComponentT } from "@tests/e2e/test-app";
import { setupTests } from "@tests/test-container";
import { getMockReq, getMockRes } from "@jest-mock/express";

describe("engine.test", () => {
  const { errorHandler, contextManager } = setupTests();

  const mockResponse = () => {
    const { res } = getMockRes();
    return res;
  };

  test("getComponent identifies component routes correctly", () => {
    expect(getComponent({ originalUrl: "/components/my-component/" })).toBe(
      "my-component"
    );

    expect(getComponent({ originalUrl: "/components/my-component" })).toBe(
      "my-component"
    );

    expect(
      getComponent({
        originalUrl: "https://localhost:8080/components/my-component",
      })
    ).toBe("my-component");

    expect(
      getComponent({ originalUrl: "/something/my-component" })
    ).toBeFalsy();
    expect(
      getComponent({ originalUrl: "https://localhost:8080/" })
    ).toBeFalsy();

    expect(
      getComponent({ originalUrl: "https://localhost:8080/component" })
    ).toBeFalsy();

    expect(
      getComponent({ originalUrl: "https://localhost:8080/components" })
    ).toBeFalsy();
  });

  test("LeanAppEngine - happy path", async () => {
    const tm = new TemplateManager(
      {
        index: {
          head: "<body>",
          tail: "</body>",
        },
      },
      errorHandler()
    );

    const jsxStreamFactory: JSXStreamFactory<SXLGlobalContext> = (
      root: SXL.StaticElement,
      globalContext: SXLGlobalContext,
      opts: JSXStreamOptions
    ) => new JSXStream(root, contextManager(globalContext), TestLogger, opts);

    const engine = new LeanAppEngine(tm, jsxStreamFactory);

    function next(err) {
      throw err;
    }

    const resp = mockResponse();

    await engine.renderWithTemplate(
      resp,
      <main>
        <div>Hello</div>
      </main>,
      {},
      { templateName: "index" },
      next
    );

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(resp.emit).toHaveBeenCalled();

    const lastCall: unknown =
      (resp.emit as jest.Mock<unknown>).mock.lastCall ?? [];

    expect(lastCall).toBeTruthy();

    const result = await readableToString(
      (lastCall as JSXStream<SXLGlobalContext>[])[1]
    );

    expect(result).toMatchInlineSnapshot(
      `"<body><main><div>Hello</div></main></body>"`
    );
  });

  test("middleware - happy path", async () => {
    const tm = new TemplateManager(
      {
        index: {
          head: "<body>",
          tail: "</body>",
        },
      },
      errorHandler()
    );

    const jsxStreamFactory: JSXStreamFactory<SXLGlobalContext> = (
      root: SXL.StaticElement,
      globalContext: SXLGlobalContext,
      opts: JSXStreamOptions
    ) => new JSXStream(root, contextManager(globalContext), TestLogger, opts);

    const engine = new LeanAppEngine(tm, jsxStreamFactory);

    engine.renderComponent = jest.fn();

    const mid = engine.middleware({
      components: [DynamicComponentT],
      globalContextParser: () => ({ myGlobalContext: "hello" }),
    });

    const req = getMockReq({
      originalUrl: "/components/dynamic-slow",
    });
    const { res, next } = getMockRes();

    mid(req, res, next);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(engine.renderComponent).toHaveBeenCalled();

    const [componentRender, context] =
      (engine.renderComponent as jest.MockedFunction<
        typeof engine.renderComponent
      >).mock.lastCall ?? [];

    expect(context).toStrictEqual({ myGlobalContext: "hello" });
    await expect(componentRender).resolves.toMatchInlineSnapshot(`
      {
        "children": [
          "Slow resource",
        ],
        "props": {
          "dataset": {},
          "id": "loaded2",
        },
        "type": "p",
      }
    `);
  });
});
