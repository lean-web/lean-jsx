import { Lazy } from "@/components";
import {
    FnElementTest,
    FnElementHandler
} from "@/jsx/component-handlers/impl/fn-component";
import { describe, expect, test } from "@jest/globals";
import { setupTests } from "@tests/test-container";

describe("function-component.test", () => {
    function MyComponent() {
        return <p data-hello="123">Hello</p>;
    }

    async function MyAsyncComponent() {
        await Promise.resolve();
        return <p data-hello="123">Hello</p>;
    }

    const { contextManager } = setupTests();
    test("FnElementHandler can handle function components", () => {
        const canHandle = FnElementTest(<MyComponent />);
        expect(canHandle).toBeTruthy();
    });

    test("FnElementHandler can handle async function components", () => {
        const canHandle = FnElementTest(<MyAsyncComponent />);
        expect(canHandle).toBeTruthy();
    });

    test("FnElementHandler cannot handle static components", () => {
        const canHandle = FnElementTest(<div></div>);
        expect(canHandle).toBeFalsy();
    });

    test("FnElementHandler cannot handle class components", () => {
        const canHandle = FnElementTest(
            <Lazy loading={<>Loading</>}>Hello</Lazy>
        );
        expect(canHandle).toBeFalsy();
    });

    test("FnElementHandler cannot handle async generator components", () => {
        async function* MyAsyncGen() {
            yield (<></>);
            await Promise.resolve();
            return <></>;
        }
        const canHandle = FnElementTest(<MyAsyncGen />);
        expect(canHandle).toBeFalsy();
    });

    test("FnElementHandler works as expected", () => {
        const handled = FnElementHandler(<MyComponent />, contextManager({}));
        expect(handled?.id).toBeTruthy();
        expect(handled?.element).toStrictEqual(<p data-hello="123">Hello</p>);
        expect(handled?.loading).toBeFalsy();
        expect(handled?.context).toBeTruthy();
        expect(handled?.handlers ?? []).toHaveLength(0);
    });

    test("FnElementHandler works as expected for async component", async () => {
        const handled = FnElementHandler(
            <MyAsyncComponent />,
            contextManager({})
        );
        expect(handled?.id).toBeTruthy();
        await expect(handled?.element).resolves.toMatchInlineSnapshot(`
{
  "children": [
    {
      "children": [
        "Hello",
      ],
      "props": {
        "data-hello": "123",
        "dataset": {},
      },
      "type": "p",
    },
  ],
  "props": {
    "id": "element-0",
  },
  "type": "template",
}
`);
        expect(handled?.loading).toBeTruthy();
        expect(handled?.loading).toMatchInlineSnapshot(`
            {
              "children": [],
              "props": {
                "dataset": {
                  "data-placeholder": "element-0",
                },
              },
              "type": "div",
            }
        `);
        expect(handled?.context).toBeTruthy();
        expect(handled?.handlers ?? []).toHaveLength(0);
    });
});
