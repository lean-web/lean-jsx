import { withClientData, toQueryString } from "@/components";
import type { ParsedComponent } from "@/jsx/component-handlers";
import { FnElementHandler } from "@/jsx/component-handlers/impl/fn-component";
import { decorateContext } from "@/jsx/context/context-decorator";
import type { SXLGlobalContext } from "lean-jsx-types/context";
import { describe, expect, test } from "@jest/globals";
import { setupTests } from "@tests/test-container";
import type { IWebActions } from "lean-jsx-types/events";

describe("context-decorator.test", () => {
  const { contextManager, renderToString } = setupTests();

  test("decorateContext", () => {
    function MyComponent(
      this: { myOtherName: string },
      { name }: { name: string },
    ) {
      function Hello({ arg2 }: { arg2: string }) {
        return (
          <div
            onload={() => {
              console.log(arg2);
            }}
          >
            {arg2} {name}
          </div>
        );
      }

      this.myOtherName = "x";
      return (
        <button onclick={() => console.log(this.myOtherName, name)}>
          Click <Hello arg2="" />
        </button>
      );
    }

    const parsed = FnElementHandler(
      <MyComponent name="Pedro" />,
      contextManager({}),
      { sync: false },
    );

    expect(parsed).toBeTruthy();

    const decorated = decorateContext(parsed as ParsedComponent);

    expect(decorated).toMatchInlineSnapshot(`
      "<script data-action-script="element-1">
            (function(){
              sxl.addEventListener('[data-action="element-1"]', 'click',sxl.actionHandler(() => console.log(this.myOtherName, name), {}));
            }).call({"myOtherName":"x"});
          </script>"
    `);
  });

  test("Decorates with web action", () => {
    function ProductListDetails(
      this: { id: string },
      {
        product,
        globalContext,
      }: { product: { id: string; name: string; description: string } } & {
        globalContext?: SXLGlobalContext;
      },
    ) {
      this.id = product.id;
      return (
        <div>
          <button
            onclick={async (ev, actions) => {
              console.log("Delete1");
              await fetch(`/product/${this.id}`, {
                method: "DELETE",
              });
              void actions.refetchAPIC("product-list", {});
            }}
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

    const parsed = FnElementHandler(
      <ProductListDetails
        product={{
          id: "123",
          name: "Some product",
          description: "Lorem ipsum dolor",
        }}
      />,
      contextManager({}),
      { sync: false },
    )!;

    expect(parsed).toBeTruthy();

    expect(parsed).toMatchInlineSnapshot(`
      {
        "context": LocalContext {
          "id": "123",
        },
        "element": {
          "children": [
            {
              "children": [
                "Delete",
              ],
              "componentType": "string",
              "props": {
                "dataset": {},
                "onclick": [Function],
              },
              "type": "button",
            },
            {
              "children": [
                {
                  "children": [
                    "Some product",
                  ],
                  "componentType": "string",
                  "props": {
                    "dataset": {},
                  },
                  "type": "h3",
                },
                {
                  "children": [
                    "Lorem ipsum dolor",
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
                "className": "product",
                "dataset": {},
                "href": "/product/123?",
              },
              "type": "a",
            },
          ],
          "componentType": "string",
          "props": {
            "dataset": {},
          },
          "type": "div",
        },
        "handlers": [],
        "id": "element-1",
        "loading": undefined,
      }
    `);

    const decorated = decorateContext(parsed);

    expect(decorated).toMatchInlineSnapshot(`""`);
  });

  test("decorates elements in a loop", async () => {
    function MyList() {
      const evv = async (
        ev: UIEvent,
        actions: IWebActions,
        data: { id: number },
      ) => {
        console.log(ev, data);
        await actions.refetchAPIC("some-el", {});
      };
      return (
        <>
          {new Array(5).fill(true).map((_, ind) => (
            <button onclick={withClientData({ id: ind }, evv)}>
              Click {ind}
            </button>
          ))}
        </>
      );
    }

    const result = await renderToString(<MyList />);

    expect(result).toMatchInlineSnapshot(`
      "<button data-action="element-3">Click 0</button><script data-action-script="element-3">
              sxl.addEventListener('[data-action="element-3"]', 'click',sxl.actionHandler(async (ev, actions, data) => {
                      console.log(ev, data);
                      await actions.refetchAPIC("some-el", {});
                  }, {"id":0}));
          </script><button data-action="element-4">Click 1</button><script data-action-script="element-4">
              sxl.addEventListener('[data-action="element-4"]', 'click',sxl.actionHandler(async (ev, actions, data) => {
                      console.log(ev, data);
                      await actions.refetchAPIC("some-el", {});
                  }, {"id":1}));
          </script><button data-action="element-5">Click 2</button><script data-action-script="element-5">
              sxl.addEventListener('[data-action="element-5"]', 'click',sxl.actionHandler(async (ev, actions, data) => {
                      console.log(ev, data);
                      await actions.refetchAPIC("some-el", {});
                  }, {"id":2}));
          </script><button data-action="element-6">Click 3</button><script data-action-script="element-6">
              sxl.addEventListener('[data-action="element-6"]', 'click',sxl.actionHandler(async (ev, actions, data) => {
                      console.log(ev, data);
                      await actions.refetchAPIC("some-el", {});
                  }, {"id":3}));
          </script><button data-action="element-7">Click 4</button><script data-action-script="element-7">
              sxl.addEventListener('[data-action="element-7"]', 'click',sxl.actionHandler(async (ev, actions, data) => {
                      console.log(ev, data);
                      await actions.refetchAPIC("some-el", {});
                  }, {"id":4}));
          </script>"
    `);
  });
});
