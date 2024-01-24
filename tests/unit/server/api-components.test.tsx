import { APIComponent } from "@/components";
import { getDynamicComponentRegistry } from "@/components/component-registry";
import { describe, expect, test } from "@jest/globals";
import { setupTests } from "@tests/test-container";
import { ProductList } from "@tests/testdata/async-component";

describe("api-components.test", () => {
  const { jsxStack, renderStackToString } = setupTests();

  test("registered APIComponent works", async () => {
    APIComponent(
      { id: "product-list", requestHandler: (_req) => ({ start: 0 }) },
      ProductList,
    );

    const dcRegistry = getDynamicComponentRegistry();

    const registryKeys = Object.keys(dcRegistry);
    expect(registryKeys).toContain("product-list");
    expect(registryKeys).toHaveLength(2);

    const stack = jsxStack({}, { sync: true });

    await stack.push(dcRegistry["product-list"].Api({}));

    function MyComponent() {
      return <button onclick={(ev, ctx) => console.log(ev)}>Click</button>;
    }

    expect(await renderStackToString(stack)).toMatchInlineSnapshot(
      `"<div class="product-list"><h1>Title</h1><p>Description</p><div class="product">P1 - Product</div><div class="product">P2 - Product</div><div class="product">P3 - Product</div><div class="product">P4 - Product</div></div>"`,
    );
  });
});
