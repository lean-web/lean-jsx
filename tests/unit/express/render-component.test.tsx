import { readableToString } from "@/jsx/html/stream/stream-utils/readable-to-string";
import { buildApp } from "@/server/express";
import { describe, expect, test } from "@jest/globals";

describe("render-component-test", () => {
    test("description", async () => {
        const app = buildApp({
            templates: { index: { head: "", tail: "" } },
            logging: {
                defaultLogLevel: "info"
            }
        });
        const stream = await app.renderComponent(<p>Hello</p>, {});

        const html = await readableToString(stream);

        expect(html).toMatchInlineSnapshot(`"<p>Hello</p>"`);
    });
});
