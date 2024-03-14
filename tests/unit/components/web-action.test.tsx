import { withClientData } from "lean-web-utils/server";
import { describe, expect, test } from "@jest/globals";
import { setupTests } from "@tests/test-container";

describe("web-action.test", () => {
  const { jsxStack } = setupTests();

  test("withClientData - passes only configured data", async () => {
    function Home({ arg, nonWebArg }: { arg: string; nonWebArg: string }) {
      return (
        <button
          onclick={withClientData({ arg }, (ev, data) =>
            console.log(data?.data?.arg, nonWebArg),
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
      />,
    );

    let first = await stack.pop();
    let all = "";

    while (first) {
      all += first;
      first = await stack.pop();
    }

    expect(all).toMatchInlineSnapshot(`
      "<button data-action="element-1">Click here!</button><script data-action-script="element-1">
              sxl.addEventListener('[data-action="element-1"]', 'click',sxl.actionHandler((ev, data) => console.log(data?.data?.arg, nonWebArg), {"arg":"This is a client parameter"}));
          </script>"
    `);
  });
});
