import { Lazy } from "@/components";
import {
    StaticElementHandler,
    StaticElementTest
} from "@/jsx/component-handlers/impl/static-component";
import { describe, expect, test } from "@jest/globals";
import { setupTests } from "@tests/test-container";

describe("static-component.test", () => {
    const { contextManager } = setupTests();
    test("StaticElementTest can handle static components", () => {
        const canHandle = StaticElementTest(<div></div>);
        expect(canHandle).toBeTruthy();
    });

    test("StaticElementTest cannot handle function components", () => {
        function MyComponent() {
            return <></>;
        }
        const canHandle = StaticElementTest(<MyComponent />);
        expect(canHandle).toBeFalsy();
    });

    test("StaticElementTest cannot handle function components", () => {
        const canHandle = StaticElementTest(
            <Lazy loading={<>Loading</>}>Hello</Lazy>
        );
        expect(canHandle).toBeFalsy();
    });

    test("StaticElementTest cannot handle async generator components", () => {
        async function* MyAsyncGen() {
            yield (<></>);
            await Promise.resolve();
            return <></>;
        }
        const canHandle = StaticElementTest(<MyAsyncGen />);
        expect(canHandle).toBeFalsy();
    });

    test("StaticElementHandler works as expected", () => {
        const handled = StaticElementHandler(
            <p data-hello="123">Hello</p>,
            contextManager({})
        );
        expect(handled?.id).toBeTruthy();
        expect(handled?.element).toStrictEqual(<p data-hello="123">Hello</p>);
        expect(handled?.loading).toBeFalsy();
        expect(handled?.context).toBeTruthy();
        expect(handled?.handlers ?? []).toHaveLength(0);
    });

    test("StaticElementHandler works as expected with handlers", () => {
        const handled = StaticElementHandler(
            <button click={() => console.log("Hello")}>Hello</button>,
            contextManager({})
        );
        expect(handled?.id).toBeTruthy();
        expect(handled?.element).toMatchInlineSnapshot(`
            {
              "children": [
                "Hello",
              ],
              "props": {
                "click": "",
                "dataset": {
                  "data-action": "element-0",
                },
              },
              "type": "button",
            }
        `);
        expect(handled?.loading).toBeFalsy();
        expect(handled?.context).toBeTruthy();
        expect(handled?.handlers ?? []).toHaveLength(1);
    });
});
