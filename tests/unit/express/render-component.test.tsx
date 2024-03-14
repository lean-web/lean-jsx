import { APIComponent } from "@/components";
import { getDynamicComponentRegistry } from "@/components/component-registry";
import { readableToString } from "@/jsx/html/stream/stream-utils/readable-to-string";
import { buildApp } from "@/server/express";
import { describe, expect, test } from "@jest/globals";
import { ProductList } from "@tests/testdata/async-component";
import { getMockReq } from "@jest-mock/express";

describe("render-component-test", () => {
  test("renders static element", async () => {
    const app = buildApp({
      templates: { index: { head: "", tail: "" } },
      logging: {
        defaultLogLevel: "info",
      },
    });
    const stream = await app.renderComponent(getMockReq(), <p>Hello</p>, {});

    const html = await readableToString(stream);

    expect(html).toMatchInlineSnapshot(
      `"<!DOCTYPE html><body><p>Hello</p></body>"`,
    );
  });

  test("renders async function", async () => {
    const app = buildApp({
      templates: { index: { head: "", tail: "" } },
      logging: {
        defaultLogLevel: "info",
      },
    });
    const stream = await app.renderComponent(getMockReq(), <ProductList />, {});

    const html = await readableToString(stream);

    expect(html).toMatchInlineSnapshot(
      `"<!DOCTYPE html><body><div class="product-list"><h1>Title</h1><p>Description</p><div class="product">P1 - Product</div><div class="product">P2 - Product</div><div class="product">P3 - Product</div><div class="product">P4 - Product</div></div></body>"`,
    );
  });

  test("renders dynamic controller (API) function", async () => {
    const app = buildApp({
      templates: { index: { head: "", tail: "" } },
      logging: {
        defaultLogLevel: "info",
      },
    });

    APIComponent(
      { id: "product-list", requestHandler: (_req) => ({ start: 0 }) },
      ProductList,
    );

    const dcRegistry = getDynamicComponentRegistry();

    const registryKeys = Object.keys(dcRegistry);
    expect(registryKeys).toContain("product-list");
    expect(registryKeys).toHaveLength(1);

    const stream = await app.renderComponent(
      getMockReq(),
      dcRegistry["product-list"].Api({}),
      {},
    );

    const html = await readableToString(stream);

    expect(html).toMatchInlineSnapshot(
      `"<!DOCTYPE html><body><div class="product-list"><h1>Title</h1><p>Description</p><div class="product">P1 - Product</div><div class="product">P2 - Product</div><div class="product">P3 - Product</div><div class="product">P4 - Product</div></div></body>"`,
    );
  });
});
