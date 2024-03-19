import {
  type JSXStreamFactory,
  type JSXStreamOptions,
  JSXStream,
} from "@/jsx/html/stream/jsx-stack";
import { readableToString } from "@/jsx/html/stream/stream-utils/readable-to-string";
import { LeanAppEngine, getComponent } from "@/server/engine";
import { TemplateManager, TestLogger } from "@/server/express";
import type { SXLGlobalContext } from "lean-jsx-types/context";
import { describe, expect, test } from "@jest/globals";
import { setupTests } from "@tests/test-container";
import { getMockReq, getMockRes } from "@jest-mock/express";
import { APIC } from "@/components";
import { ProductList } from "@tests/testdata/async-component";
import type { Request } from "express";

describe("engine.test", () => {
  const { errorHandler, contextManager, renderToString } = setupTests();

  const mockResponse = () => {
    const { res } = getMockRes();
    return res;
  };

  test("getComponent identifies component routes correctly", () => {
    expect(getComponent({ originalUrl: "/components/my-component/" })).toBe(
      "my-component",
    );

    expect(getComponent({ originalUrl: "/components/my-component" })).toBe(
      "my-component",
    );

    expect(
      getComponent({
        originalUrl: "https://localhost:8080/components/my-component",
      }),
    ).toBe("my-component");

    expect(
      getComponent({ originalUrl: "/something/my-component" }),
    ).toBeFalsy();
    expect(
      getComponent({ originalUrl: "https://localhost:8080/" }),
    ).toBeFalsy();

    expect(
      getComponent({ originalUrl: "https://localhost:8080/component" }),
    ).toBeFalsy();

    expect(
      getComponent({ originalUrl: "https://localhost:8080/components" }),
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
      errorHandler(),
    );

    const jsxStreamFactory: JSXStreamFactory = (
      root: SXL.Element,
      request: Request,
      globalContext: SXLGlobalContext,
      opts: JSXStreamOptions,
    ) => new JSXStream(root, contextManager(globalContext), TestLogger, opts);

    const engine = new LeanAppEngine(tm, jsxStreamFactory);

    function next(err) {
      throw err;
    }

    const resp = mockResponse();

    await engine.renderWithTemplate(
      getMockReq(),
      resp,
      <main>
        <div>Hello</div>
      </main>,
      {},
      { templateName: "index" },
      next,
    );

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(resp.emit).toHaveBeenCalled();

    const lastCall: unknown =
      (resp.emit as jest.Mock<unknown>).mock.lastCall ?? [];

    expect(lastCall).toBeTruthy();

    const result = await readableToString((lastCall as JSXStream[])[1]);

    expect(result).toMatchInlineSnapshot(
      `"<body><main><div>Hello</div></main></body>"`,
    );
  });

  test("middleware - auto register", async () => {
    const tm = new TemplateManager(
      {
        index: {
          head: "<body>",
          tail: "</body>",
        },
      },
      errorHandler(),
    );

    const jsxStreamFactory: JSXStreamFactory = (
      root: SXL.Element,
      request: Request,
      globalContext: SXLGlobalContext,
      opts: JSXStreamOptions,
    ) => new JSXStream(root, contextManager(globalContext), TestLogger, opts);

    const engine = new LeanAppEngine(tm, jsxStreamFactory);

    engine.renderComponent = jest.fn();

    APIC(
      { id: "product-list", requestHandler: (_req) => ({ start: 0 }) },
      ProductList,
    );

    //   const dcRegistry = getDynamicComponentRegistry();

    const mid = engine.middleware({
      //   components: [DynamicComponentT],
      globalContextParser: () => ({ start: 2 }),
    });

    const req = getMockReq({
      originalUrl: "/components/product-list",
    });
    const { res, next } = getMockRes();

    mid(req, res, next);

    // wait for middleware to finish processing:
    await engine.middlwareProcessFlag?.promise;

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(engine.renderComponent).toHaveBeenCalled();

    // get the actuall processed component to verify it is correct:
    const [_, componentRender, context] =
      (
        engine.renderComponent as jest.MockedFunction<
          typeof engine.renderComponent
        >
      ).mock.lastCall ?? [];

    expect(context).toStrictEqual({ start: 0 });
    // componentRender is a Promise in this test case.
    // it needs to be awaited before passing it to renderToString
    const rendered = await renderToString(
      (await componentRender) as SXL.StaticElement,
    );

    expect(rendered).toMatchInlineSnapshot(`
      "<div class="product-list"><h1>Title</h1><p>Description</p><div data-placeholder="element-4"></div><div data-placeholder="element-5"></div><div data-placeholder="element-6"></div><div data-placeholder="element-7"></div></div><template id="element-4"><div class="product">P1 - Product</div></template><script>
         sxl.fillPlaceHolder("element-4");  
       </script>
       <template id="element-5"><div class="product">P2 - Product</div></template><script>
         sxl.fillPlaceHolder("element-5");  
       </script>
       <template id="element-6"><div class="product">P3 - Product</div></template><script>
         sxl.fillPlaceHolder("element-6");  
       </script>
       <template id="element-7"><div class="product">P4 - Product</div></template><script>
         sxl.fillPlaceHolder("element-7");  
       </script>
       "
    `);
  });

  test.skip("middleware - happy path", async () => {
    const tm = new TemplateManager(
      {
        index: {
          head: "<body>",
          tail: "</body>",
        },
      },
      errorHandler(),
    );

    const jsxStreamFactory: JSXStreamFactory = (
      root: SXL.Element,
      request: Request,
      globalContext: SXLGlobalContext,
      opts: JSXStreamOptions,
    ) => new JSXStream(root, contextManager(globalContext), TestLogger, opts);

    const engine = new LeanAppEngine(tm, jsxStreamFactory);

    engine.renderComponent = jest.fn();

    const mid = engine.middleware({
      components: [
        // DynamicComponentT
      ],
      globalContextParser: () => ({ myGlobalContext: "hello" }),
    });

    const req = getMockReq({
      originalUrl: "/components/dynamic-slow",
    });
    const { res, next } = getMockRes();

    mid(req, res, next);

    await engine.middlwareProcessFlag?.promise;

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(engine.renderComponent).toHaveBeenCalled();

    const [componentRender, context] =
      (
        engine.renderComponent as jest.MockedFunction<
          typeof engine.renderComponent
        >
      ).mock.lastCall ?? [];

    expect(context).toStrictEqual({ myGlobalContext: "hello" });
    await expect(componentRender).resolves.toMatchInlineSnapshot(`
      {
        "children": [
          "Slow resource",
        ],
        "componentType": "string",
        "props": {
          "dataset": {},
          "id": "loaded2",
        },
        "type": "p",
      }
    `);
  });
});
