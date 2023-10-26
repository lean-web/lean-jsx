import { describe, expect, test } from "@jest/globals";
import { jsxToDOMTest } from "../test-utils-dom";
import { Lazy } from "@/components/lazy";

describe("DOM test", () => {
    test("Base flow", async () => {
        const doms = await jsxToDOMTest(<p>Hello</p>);

        expect(doms[0]).toBe("<p>Hello</p>");
    });

    test("Async flow", async () => {
        async function ACmp() {
            await Promise.resolve();
            return <p>Hello world</p>;
        }

        const doms = await jsxToDOMTest(
            <div>
                <h1>Hello</h1>
                <ACmp />
            </div>
        );

        expect(doms).toMatchInlineSnapshot(`
[
  "<div><h1>Hello</h1><div data-placeholder="element-2"></div></div>",
  "<div><h1>Hello</h1><div data-placeholder="element-2"></div></div><template id="element-2"><p>Hello world</p></template>",
  "<div><h1>Hello</h1><p>Hello world</p></div><script> sxl.fillPlaceHolder("element-2"); </script> ",
  "<div><h1>Hello</h1><p>Hello world</p></div><script> sxl.fillPlaceHolder("element-2"); </script>",
]
`);
    });

    test("Async flow with loading state", async () => {
        async function ACmp() {
            await Promise.resolve();
            return <p>Hello world</p>;
        }

        const doms = await jsxToDOMTest(
            <div>
                <h1>Hello</h1>
                <Lazy loading={<>Loading</>}>
                    <ACmp />
                </Lazy>
            </div>
        );

        expect(doms).toMatchInlineSnapshot(`
[
  "<div><h1>Hello</h1><div data-placeholder="element-2">Loading</div></div>",
  "<div><h1>Hello</h1><div data-placeholder="element-2">Loading</div></div><template id="element-2"><div data-placeholder="element-3"></div></template>",
  "<div><h1>Hello</h1><div data-placeholder="element-2">Loading</div></div><template id="element-2"><div data-placeholder="element-3"></div></template>",
  "<div><h1>Hello</h1><div data-placeholder="element-3">Loading</div></div><script> sxl.fillPlaceHolder("element-2"); </script> <template id="element-3"><p>Hello world</p></template>",
  "<div><h1>Hello</h1><div data-placeholder="element-3">Loading</div></div><script> sxl.fillPlaceHolder("element-2"); </script>",
  "<div><h1>Hello</h1><p>Hello world</p></div><script> sxl.fillPlaceHolder("element-2"); </script> <script> sxl.fillPlaceHolder("element-3"); </script> ",
  "<div><h1>Hello</h1><div data-placeholder="element-3">Loading</div></div><script> sxl.fillPlaceHolder("element-2"); </script>",
  "<div><h1>Hello</h1><p>Hello world</p></div><script> sxl.fillPlaceHolder("element-2"); </script> <script> sxl.fillPlaceHolder("element-3"); </script>",
]
`);
    });
});
