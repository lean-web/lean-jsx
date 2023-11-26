import { webAction, toQueryString } from "@/components";
import { ParsedComponent } from "@/jsx/component-handlers";
import { FnElementHandler } from "@/jsx/component-handlers/impl/fn-component";
import { decorateContext } from "@/jsx/context/context-decorator";
import { SXLGlobalContext } from "lean-jsx-types/lib/context";
import { describe, expect, test } from "@jest/globals";
import { setupTests } from "@tests/test-container";
import { WebContext } from "lean-jsx-types/lib/global";

describe("context-decorator.test", () => {
  const { contextManager, renderToString } = setupTests();

  test("decorateContext", () => {
    function MyComponent(
      this: { myOtherName: string },
      { name }: { name: string }
    ) {
      function Hello({ arg2 }: { arg2: string }) {
        return (
          <div
            onload={() => {
              // eslint-disable-next-line lean-jsx/no-outer-scope-in-handlers
              console.log(arg2);
            }}
          >
            {arg2} {name}
          </div>
        );
      }

      this.myOtherName = "x";
      return (
        // eslint-disable-next-line lean-jsx/no-outer-scope-in-handlers
        <button onclick={() => console.log(this.myOtherName, name)}>
          Click <Hello arg2="" />
        </button>
      );
    }

    const parsed = FnElementHandler(
      <MyComponent name="Pedro" />,
      contextManager({})
    );

    expect(parsed).toBeTruthy();

    const decorated = decorateContext(parsed as ParsedComponent);

    expect(decorated).toMatchInlineSnapshot(`
      "<script type="application/javascript">
            (function(){
              sxl.addEventListener('[data-action="element-0"]', 'click',() => console.log(this.myOtherName, name));
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
      }
    ) {
      this.id = product.id;
      return (
        <div>
          <button
            onclick={webAction({}, async (ev, ctx) => {
              console.log("Delete1");
              await fetch(`/product/${this.id}`, {
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

    const parsed = FnElementHandler(
      <ProductListDetails
        product={{
          id: "123",
          name: "Some product",
          description: "Lorem ipsum dolor",
        }}
      />,
      contextManager({})
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
              "props": {
                "dataset": {},
                "onclick": {
                  "data": {},
                  "handler": [Function],
                },
              },
              "type": "button",
            },
            {
              "children": [
                {
                  "children": [
                    "Some product",
                  ],
                  "props": {
                    "dataset": {},
                  },
                  "type": "h3",
                },
                {
                  "children": [
                    "Lorem ipsum dolor",
                  ],
                  "props": {
                    "dataset": {},
                  },
                  "type": "p",
                },
              ],
              "props": {
                "className": "product",
                "dataset": {},
                "href": "/product/123?",
              },
              "type": "a",
            },
          ],
          "props": {
            "dataset": {},
          },
          "type": "div",
        },
        "handlers": [],
        "id": "element-0",
        "loading": undefined,
      }
    `);

    const decorated = decorateContext(parsed);

    expect(decorated).toMatchInlineSnapshot(`""`);
  });

  test("decorates elements in a loop", async () => {
    function MyList() {
      const evv = async (
        ev: MouseEvent | undefined,
        ctx:
          | WebContext<{
              id: number;
            }>
          | undefined
      ) => {
        console.log(ev);
        await ctx?.actions.refetchElement("some-el", {});
      };
      return (
        <>
          {new Array(5).fill(true).map((_, ind) => (
            <button onclick={webAction({ id: ind }, evv)}>Click {ind}</button>
          ))}
        </>
      );
    }

    const result = await renderToString(<MyList />);

    expect(result).toMatchInlineSnapshot(`
      "<button data-action="element-2">Click </button><script type="application/javascript">
              sxl.addEventListener('[data-action="element-2"]', 'click',sxl.actionHandler(async (ev, ctx) => {
                      console.log(ev);
                      await ctx?.actions.refetchElement("some-el", {});
                  }, {"id":0}));
          </script><button data-action="element-3">Click 1</button><script type="application/javascript">
              sxl.addEventListener('[data-action="element-3"]', 'click',sxl.actionHandler(async (ev, ctx) => {
                      console.log(ev);
                      await ctx?.actions.refetchElement("some-el", {});
                  }, {"id":1}));
          </script><button data-action="element-4">Click 2</button><script type="application/javascript">
              sxl.addEventListener('[data-action="element-4"]', 'click',sxl.actionHandler(async (ev, ctx) => {
                      console.log(ev);
                      await ctx?.actions.refetchElement("some-el", {});
                  }, {"id":2}));
          </script><button data-action="element-5">Click 3</button><script type="application/javascript">
              sxl.addEventListener('[data-action="element-5"]', 'click',sxl.actionHandler(async (ev, ctx) => {
                      console.log(ev);
                      await ctx?.actions.refetchElement("some-el", {});
                  }, {"id":3}));
          </script><button data-action="element-6">Click 4</button><script type="application/javascript">
              sxl.addEventListener('[data-action="element-6"]', 'click',sxl.actionHandler(async (ev, ctx) => {
                      console.log(ev);
                      await ctx?.actions.refetchElement("some-el", {});
                  }, {"id":4}));
          </script>"
    `);
  });
});
