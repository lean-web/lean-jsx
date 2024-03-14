import { withClientData } from "lean-web-utils/server";
import { describe, expect, test } from "@jest/globals";
import { setupTests } from "@tests/test-container";
import { APIComponent } from "@/components";
import { getMockReq, getMockRes } from "@jest-mock/express";
import {
  getDynamicComponentRegistry,
  registerAPIComponent,
} from "@/components/component-registry";
import { SXLGlobalContext } from "lean-jsx-types/context";

async function fetchProducts() {
  return await Promise.resolve([
    { id: 1, name: "P1" },
    { id: 2, name: "P2" },
  ]);
}

describe("component-registry.test", () => {
  test("registerAPIComponent registers APIComponents correctly", async () => {
    registerAPIComponent<
      SXLGlobalContext,
      { products: { id: number; name: string }[] }
    >({
      Api: ({ products }) => {
        return (
          <div>
            <h2>Products</h2>
            <ul className="product-list">
              {products.map((product) => (
                <li>
                  {product.id}: {product.name}
                </li>
              ))}
            </ul>
          </div>
        );
      },
      contentId: "product-list",
      requestHandler: async () => {
        return { products: await fetchProducts() };
      },
      cache: "public, max-age=30",
    });

    const dcRegistry = getDynamicComponentRegistry();
    const registryKeys = Object.keys(dcRegistry);
    expect(registryKeys).toContain("product-list");
    expect(registryKeys).toHaveLength(1);

    const controller = dcRegistry["product-list"];
    expect(controller.requestHandler).toBeTruthy();
    const req = getMockReq({
      originalUrl: "/components/product-list",
    });
    const props = await controller.requestHandler!(req);

    expect(Array.isArray(props["products"])).toBeTruthy();
    expect(Array(props["products"])).toStrictEqual([
      [
        { id: 1, name: "P1" },
        { id: 2, name: "P2" },
      ],
    ]);
  });
});
