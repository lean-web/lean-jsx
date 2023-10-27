import { TemplateManager } from "@/server/express";
import { describe, expect, test } from "@jest/globals";
import { setupTests } from "@tests/test-container";

describe("template-manager.test", () => {
  const { errorHandler } = setupTests();
  test("template manager with strings", () => {
    const tm = new TemplateManager(
      {
        index: {
          head: "<body>",
          tail: "</body>",
        },
      },
      errorHandler()
    );

    expect(tm.getHeadAndTail("index")).toMatchInlineSnapshot(`
      [
        "<body>",
        "</body>",
      ]
    `);
    expect(tm.getHeadAndTail("something_else")).toStrictEqual(["", ""]);
  });
});
