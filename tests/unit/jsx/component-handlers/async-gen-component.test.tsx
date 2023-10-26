import { Lazy } from "@/components";
import {
    AsyncGenElementHandler,
    AsyncGenElementTest
} from "@/jsx/component-handlers/impl/async-gen-component";
import { describe, expect, test } from "@jest/globals";
import { setupTests } from "@tests/test-container";

describe("async-gen-component.test", () => {
    async function* MyComponent() {
        yield (<>Loading</>);
        await Promise.resolve();
        return <p data-hello="123">Hello</p>;
    }

    async function* MyComponentWithActions() {
        yield (<>Loading</>);
        await Promise.resolve();
        return (
            <button data-hello="123" onclick={() => console.log("Click")}>
                Hello
            </button>
        );
    }

    const { contextManager } = setupTests();
    test("AsyncGenElementTest can handle function components", () => {
        const canHandle = AsyncGenElementTest(<MyComponent />);
        expect(canHandle).toBeTruthy();
    });

    test("AsyncGenElementTest cannot handle static components", () => {
        const canHandle = AsyncGenElementTest(<div></div>);
        expect(canHandle).toBeFalsy();
    });

    test("AsyncGenElementTest cannot handle function components", () => {
        function MyComponent() {
            return <></>;
        }
        const canHandle = AsyncGenElementTest(<MyComponent />);
        expect(canHandle).toBeFalsy();
    });

    test("AsyncGenElementTest cannot handle class components", () => {
        const canHandle = AsyncGenElementTest(
            <Lazy loading={<>Loading</>}>Hello</Lazy>
        );
        expect(canHandle).toBeFalsy();
    });

    test("AsyncGenElementTest works as expected", async () => {
        const handled = AsyncGenElementHandler(
            <MyComponent />,
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
        await expect(handled?.loading).resolves.toMatchInlineSnapshot(`
            {
              "children": [
                "Loading",
              ],
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

    test("AsyncGenElementTest works as expected with actions", async () => {
        const handled = AsyncGenElementHandler(
            <MyComponentWithActions />,
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
        "onclick": [Function],
      },
      "type": "button",
    },
  ],
  "props": {
    "id": "element-0",
  },
  "type": "template",
}
`);
        expect(handled?.loading).toBeTruthy();
        await expect(handled?.loading).resolves.toMatchInlineSnapshot(`
            {
              "children": [
                "Loading",
              ],
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
