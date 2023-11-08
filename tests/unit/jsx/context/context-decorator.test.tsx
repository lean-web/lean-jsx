import { ParsedComponent } from "@/jsx/component-handlers";
import { FnElementHandler } from "@/jsx/component-handlers/impl/fn-component";
import { decorateContext } from "@/jsx/context/context-decorator";
import { describe, expect, test } from "@jest/globals";
import { setupTests } from "@tests/test-container";

describe("context-decorator.test", () => {
  const { contextManager } = setupTests();

  test("decorateContext", () => {
    function MyComponent(
      this: { myOtherName: string },
      { name }: { name: string },
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
      contextManager({}),
    );

    expect(parsed).toBeTruthy();

    const decorated = decorateContext(parsed as ParsedComponent);

    expect(decorated).toMatchInlineSnapshot(`
      "<script type="application/javascript">
            (function(){
              document.querySelector('[data-action="element-0"]').addEventListener('click', () => console.log(this.myOtherName, name));
            }).call({"myOtherName":"x"});
          </script>"
    `);
  });
});
