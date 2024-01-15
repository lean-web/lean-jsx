/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, expect, test } from "@jest/globals";
import { withSxlStaticElement } from "../test-utils";
import { readableToString } from "@/jsx/html/stream/stream-utils/readable-to-string";
import { setupTests } from "@tests/test-container";

describe("JSXToHTMLStream - Unit Tests", () => {
  const { jsxStream } = setupTests();
  test("Base case", async () => {
    const stream = jsxStream(<p>Hello</p>, { username: "" });
    await stream.init();

    const result = await readableToString(stream);
    expect(result).toEqual("<p>Hello</p>");
  }, 2000);

  test("With className", async () => {
    const stream = jsxStream(
      {
        type: "p",
        componentType: "string",
        props: {
          className: "hello",
          dataset: {},
        },
        children: [],
      },
      { username: "" }
    );
    await stream.init();

    const result = await readableToString(stream);
    expect(result).toEqual(`<p class="hello"></p>`);
  }, 2000);

  test("With style", async () => {
    const stream = jsxStream(
      {
        type: "p",
        componentType: "string",
        props: {
          style: {
            backgroundColor: "red",
            padding: "10px",
          },
          dataset: {},
        },
        children: [],
      },

      { username: "" }
      // ["", ""]
    );
    await stream.init();

    const result = await readableToString(stream);
    expect(result).toEqual(
      `<p style="background-color: red; padding: 10px;"></p>`
    );
  }, 2000);

  test("With on click", async () => {
    const stream = jsxStream(
      {
        type: "button",
        componentType: "string",
        props: {
          onclick: function (ev) {
            console.log(ev);
          },
          dataset: {},
        },
        children: [],
      },

      { username: "" }
      // ["", ""]
    );

    await stream.init();

    const result = await readableToString(stream);
    const clean = result.replace(/[ \n]{1,}/g, " ");
    expect(clean).toMatchInlineSnapshot(
      `"<button data-action="element-1"></button><script data-action-script="element-1"> sxl.addEventListener('[data-action="element-1"]', 'click',sxl.actionHandler(function (ev) { console.log(ev); }, {})); </script>"`
    );
  }, 2000);

  test("Function", async () => {
    const stream = jsxStream(
      {
        type: ({ className }) => ({
          type: "button",
          componentType: "string",
          props: {
            className,
          },
          children: ["Click"],
        }),
        componentType: "function",
        props: {
          className: "btn",
          dataset: {},
        },
        children: [],
      },

      { username: "" }
    );
    await stream.init();

    const result = await readableToString(stream);
    const clean = result.replace(/[ \n]{1,}/g, " ");
    expect(clean).toEqual(`<button class="btn">Click</button>`);
  }, 2000);

  test("With children", async () => {
    const stream = jsxStream(
      {
        type: "div",
        componentType: "string",
        props: {
          className: "container",
          dataset: {},
        },
        children: [
          {
            type: "span",
            componentType: "string",
            props: {},
            children: ["hello"],
          },
          "friend",
        ],
      },

      { username: "" }
      // ["", ""]
    );
    await stream.init();

    const result = await readableToString(stream);
    const clean = result.replace(/[ \n]{1,}/g, " ");
    expect(clean).toEqual(
      `<div class="container"><span>hello</span>friend</div>`
    );
  }, 2000);

  test("Fragment", async () => {
    const stream = jsxStream(
      {
        type: "fragment",
        componentType: "string",
        props: {
          className: "container",
          dataset: {},
        },
        children: [
          {
            type: "span",
            componentType: "string",
            props: {},
            children: ["hello"],
          },
          "friend",
        ],
      },

      { username: "" }
      // ["", ""]
    );
    await stream.init();

    const result = await readableToString(stream);
    const clean = result.replace(/[ \n]{1,}/g, " ");
    expect(clean).toMatchInlineSnapshot(`"<span>hello</span>friend"`);
  }, 2000);

  test("With async component", async () => {
    const stream = jsxStream(
      {
        // eslint-disable-next-line @typescript-eslint/require-await
        type: async ({ children }) =>
          withSxlStaticElement({
            withChild:
              children && typeof children[0] === "object"
                ? children[0]
                : undefined,
          }),
        componentType: "function",
        props: {
          className: "container",
          dataset: {},
        },
        children: [
          {
            type: "span",
            componentType: "string",
            props: {},
            children: ["hello"],
          },
          "friend",
        ],
      },

      { username: "" }
      // ["", ""]
    );
    await stream.init();

    const result = await readableToString(stream);

    expect(result).toMatchInlineSnapshot(
      `"<div data-placeholder="element-1"></div><template id="element-1"><p><span>hello</span></p></template><script> sxl.fillPlaceHolder("element-1"); </script>"`
    );
  }, 2000);
});
