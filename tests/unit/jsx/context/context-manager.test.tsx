import { describe, expect, test } from "@jest/globals";
import { setupTests } from "@tests/test-container";

describe("context-manager.test", () => {
    const { contextManager: ctxManagerFactory } = setupTests();
    test("processHandlers", () => {
        const contextManager = ctxManagerFactory({ username: "" });

        const handlers = contextManager.processHandlers(
            "myid",
            <button onclick={() => console.log("Success")}></button>
        );

        expect(handlers).toMatchInlineSnapshot(`
            [
              [
                "onclick",
                "() => console.log("Success")",
              ],
            ]
        `);
    });

    test("processElement - static", () => {
        const contextManager = ctxManagerFactory({ username: "" });

        const processed = contextManager.processElement(
            "myid",
            { name: "Pedro" },
            <button onclick={() => console.log("Success")}></button>
        );

        expect(processed).toMatchInlineSnapshot(`
            {
              "context": {
                "name": "Pedro",
              },
              "element": {
                "children": [],
                "props": {
                  "dataset": {
                    "data-action": "myid",
                  },
                  "onclick": "",
                },
                "type": "button",
              },
              "handlers": [
                [
                  "onclick",
                  "() => console.log("Success")",
                ],
              ],
              "id": "myid",
              "placeholder": undefined,
            }
        `);
    });

    test("processElement - async with no loading state", async () => {
        const contextManager = ctxManagerFactory({ username: "" });

        async function MyComponent() {
            await Promise.resolve();
            return <p>Hello async</p>;
        }

        const processed = contextManager.processElement(
            "myid",
            { name: "Pedro" },
            MyComponent()
        );

        await expect(processed.element).resolves.toMatchInlineSnapshot(`
            {
              "children": [
                {
                  "children": [
                    "Hello async",
                  ],
                  "props": {
                    "dataset": {},
                  },
                  "type": "p",
                },
              ],
              "props": {
                "id": "myid",
              },
              "type": "template",
            }
        `);

        expect(processed.placeholder).toMatchInlineSnapshot(`
            {
              "children": [],
              "props": {
                "dataset": {
                  "data-placeholder": "myid",
                },
              },
              "type": "div",
            }
        `);
    });

    test("processElement - async with loading state", async () => {
        const contextManager = ctxManagerFactory({ username: "" });

        async function MyComponent() {
            await Promise.resolve();
            return <p>Hello async</p>;
        }

        const processed = contextManager.processElement(
            "myid",
            { name: "Pedro" },
            MyComponent(),
            <p>Loading...</p>
        );

        await expect(processed.element).resolves.toMatchInlineSnapshot(`
            {
              "children": [
                {
                  "children": [
                    "Hello async",
                  ],
                  "props": {
                    "dataset": {},
                  },
                  "type": "p",
                },
              ],
              "props": {
                "id": "myid",
              },
              "type": "template",
            }
        `);

        expect(processed.placeholder).toMatchInlineSnapshot(`
            {
              "children": [
                {
                  "children": [
                    "Loading...",
                  ],
                  "props": {
                    "dataset": {},
                  },
                  "type": "p",
                },
              ],
              "props": {
                "dataset": {
                  "data-placeholder": "myid",
                },
              },
              "type": "div",
            }
        `);
    });

    test("processElement - async with async loading state", async () => {
        const contextManager = ctxManagerFactory({ username: "" });

        async function MyComponent() {
            await Promise.resolve();
            return <p>Hello async</p>;
        }

        async function Loading() {
            await Promise.resolve();
            return <p>Loading</p>;
        }

        const processed = contextManager.processElement(
            "myid",
            { name: "Pedro" },
            MyComponent(),
            Loading()
        );

        await expect(processed.element).resolves.toMatchInlineSnapshot(`
            {
              "children": [
                {
                  "children": [
                    "Hello async",
                  ],
                  "props": {
                    "dataset": {},
                  },
                  "type": "p",
                },
              ],
              "props": {
                "id": "myid",
              },
              "type": "template",
            }
        `);

        await expect(processed.placeholder).resolves.toMatchInlineSnapshot(`
            {
              "children": [
                {
                  "children": [
                    "Loading",
                  ],
                  "props": {
                    "dataset": {},
                  },
                  "type": "p",
                },
              ],
              "props": {
                "dataset": {
                  "data-placeholder": "myid",
                },
              },
              "type": "div",
            }
        `);
    });
});
