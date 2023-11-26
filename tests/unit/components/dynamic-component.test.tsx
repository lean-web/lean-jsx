import { DynamicComponent, Register, TrackedPromise } from "@/components";
import { describe, expect, test } from "@jest/globals";
import { setupTests } from "@tests/test-container";

describe("dynamic-component", () => {
  const { jsxStack } = setupTests();

  test("dynamic component - default", async () => {
    const stack = jsxStack({ username: "Pedro" });

    async function wait(timeInMillis: number): Promise<void> {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, timeInMillis);
      });
    }

    @Register
    class MyComponent extends DynamicComponent<string> {
      componentID = "dynamic-slow";

      async fetcher() {
        await wait(100);
        return "Slow resource";
      }

      dynamicRender(
        resource: TrackedPromise<string>,
      ): SXL.StaticElement | SXL.AsyncElement {
        if (resource.isPending) {
          return <p id="loading2">Loading...</p>;
        }
        return <p id="loaded2">{resource.value}</p>;
      }
    }

    await stack.push(<MyComponent />);

    let first = await stack.pop();
    let all = "";

    while (first) {
      all += first;
      first = await stack.pop();
    }

    expect(all).toMatchInlineSnapshot(
      `"<dynamic-component data-id="dynamic-slow?username=Pedro"><p id="loading2">Loading...</p></dynamic-component>"`,
    );
  });
});
