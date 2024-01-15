import { toQueryString } from "@/components";
import { withClientData } from "lean-web-utils/lib/server";
import { SXLGlobalContext } from "lean-jsx-types/lib/context";
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
          "sxl.actionHandler(() => console.log("Success"), {})",
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
          "componentType": "string",
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
            "sxl.actionHandler(() => console.log("Success"), {})",
          ],
        ],
        "id": "myid",
        "loading": undefined,
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
            "componentType": "string",
            "props": {
              "dataset": {},
            },
            "type": "p",
          },
        ],
        "componentType": "string",
        "props": {
          "id": "myid",
        },
        "type": "template",
      }
    `);

    expect(processed.loading).toMatchInlineSnapshot(`
      {
        "children": [],
        "componentType": "string",
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
            "componentType": "string",
            "props": {
              "dataset": {},
            },
            "type": "p",
          },
        ],
        "componentType": "string",
        "props": {
          "id": "myid",
        },
        "type": "template",
      }
    `);

    expect(processed.loading).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              "Loading...",
            ],
            "componentType": "string",
            "props": {
              "dataset": {},
            },
            "type": "p",
          },
        ],
        "componentType": "string",
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
            "componentType": "string",
            "props": {
              "dataset": {},
            },
            "type": "p",
          },
        ],
        "componentType": "string",
        "props": {
          "id": "myid",
        },
        "type": "template",
      }
    `);

    await expect(processed.loading).resolves.toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              "Loading",
            ],
            "componentType": "string",
            "props": {
              "dataset": {},
            },
            "type": "p",
          },
        ],
        "componentType": "string",
        "props": {
          "dataset": {
            "data-placeholder": "myid",
          },
        },
        "type": "div",
      }
    `);
  });

  test("Decorates with web action", () => {
    function ProductListDetails({
      product,
      globalContext,
    }: { product: { id: string; name: string; description: string } } & {
      globalContext?: SXLGlobalContext;
    }) {
      return (
        <div>
          <button
            onclick={withClientData({ id: product.id }, async (ev, ctx) => {
              console.log("Delete1");
              await fetch(`/product/${ctx?.data.id}`, {
                method: "DELETE",
              });
              void ctx?.actions.refetchElement("product-list", {});
            })}
          >
            Delete
          </button>
          <a
            href={toQueryString(`/product/${product.id}`, globalContext)}
            className="product"
          >
            <h3>{product.name}</h3>
            <p>{product.description.slice(0, 50)}</p>
          </a>
        </div>
      );
    }

    const contextManager = ctxManagerFactory({ username: "" });

    const processed = contextManager.processElement(
      "myid",
      { name: "Pedro" },
      <ProductListDetails
        product={{
          id: "123",
          name: "Some product",
          description: "Lorem ipsum dolor",
        }}
      />,
      <p>Loading...</p>
    );

    expect(processed.element).toMatchInlineSnapshot(`
      {
        "children": [],
        "componentType": "function",
        "props": {
          "dataset": {},
          "product": {
            "description": "Lorem ipsum dolor",
            "id": "123",
            "name": "Some product",
          },
        },
        "type": [Function],
      }
    `);
    expect(processed.context).toMatchInlineSnapshot(`
      {
        "name": "Pedro",
      }
    `);
    expect(processed.handlers).toMatchInlineSnapshot(`[]`);
  });
});
