import { webAction } from "@/components/web-action";
import { describe, expect, test } from "@jest/globals";
import { setupTests } from "@tests/test-container";

describe("web-action.test", () => {
  const { jsxStack } = setupTests();

  test("webAction - passes only configured data", async () => {
    function Home({ arg, nonWebArg }: { arg: string; nonWebArg: string }) {
      return (
        <button
          onclick={webAction({ arg }, (ev, data) =>
            // eslint-disable-next-line lean-jsx/no-outer-scope-in-handlers
            console.log(data?.data?.arg, nonWebArg)
          )}
        >
          Click here!
        </button>
      );
    }

    const stack = jsxStack({ username: "Pedro" });
    void stack.push(
      <Home
        arg="This is a client parameter"
        nonWebArg="This is a server only parameter"
      />
    );

    let first = await stack.pop();
    let all = "";

    while (first) {
      all += first;
      first = await stack.pop();
    }

    expect(all).toMatchInlineSnapshot(`
      "<button data-action="element-0">Click here!</button><script type="application/javascript">
              document.querySelector('[data-action="element-0"]').addEventListener('click', (ev) => { const h = (ev, data) => 
                      // eslint-disable-next-line lean-jsx/no-outer-scope-in-handlers
                      console.log(data?.data?.arg, nonWebArg);
       h(ev, {
                  data: {"arg":"This is a client parameter"},
                  actions: {
                      refetchElement: sxl.refetchElement
                  }
               }); });
          </script>"
    `);
  });
});
