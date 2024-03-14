import { EventExtractor } from "@/plugins/esbuild/extract-events";
import { describe, expect, test } from "@jest/globals";
import { validateTypeScriptCode } from "./validate-ts";
import path from "path";
import fs from "fs";

function validateHandlersExist(source: string, extractor: EventExtractor) {
  return (
    Array.from(extractor.existingHandlers.values()).filter((handler) =>
      source.includes(handler),
    ).length === extractor.existingHandlers.size
  );
}

const tsConfig = path.join(process.cwd(), "./packages/core/tsconfig.json");

describe("extract-events.test", () => {
  let extractor: EventExtractor;
  beforeAll(() => {
    extractor = new EventExtractor();
  });

  afterEach(() => {
    extractor.clear();
  });

  test("ts event extractor find a single action", () => {
    const source = `
      export function MyComponent() {
        return <button onclick={(ev) => console.log(ev)}>Click</button> 
      }
        `;

    expect(validateTypeScriptCode(source, tsConfig)).toBeFalsy();
    const transformed = extractor.fileTransformer(source);

    expect(transformed).toMatchInlineSnapshot(`
      "export function MyComponent() {
          return <button onclick={(ev) => { return window.sxl_user.fn14533fb3b06a348bf24a9f456f6b9275(ev); }}>Click</button>;
      }
      "
    `);

    expect(
      validateTypeScriptCode(
        `declare global {
          interface Window { sxl_user: any; }
      }\n${transformed}`,
        tsConfig,
      ),
    ).toBeFalsy();

    expect(extractor.getActionsPerFile()).toMatchInlineSnapshot(`
      [
        [
          "file.tsx",
          "
      import { withClientData } from "lean-web-utils/server";
      type Arg = Parameters<typeof withClientData>[1]
      // file.tsx
      export const fn14533fb3b06a348bf24a9f456f6b9275 = (ev) => console.log(ev);
      ",
        ],
      ]
    `);
  });

  test("ts event extractor find a webAction action", () => {
    const source = `
    import {  withClientData } from "@/components";
    function MyComponent() {
        const user = { firstName: "John" };
        return (
            <button
                onclick={withClientData(user, (ev, webContext) => {
                    alert(\`Hello \${webContext?.data.firstName}\`);
                })}
            >
                Click to greet user
            </button>
        );
    }
  `;

    expect(validateTypeScriptCode(source, tsConfig)).toBeFalsy();
    const transformed = extractor.fileTransformer(source);

    expect(validateHandlersExist(transformed, extractor)).toBeTruthy();

    expect(transformed).toMatchInlineSnapshot(`
      "import { withClientData } from "@/components";
      function MyComponent() {
          const user = { firstName: "John" };
          return (<button onclick={withClientData(user, (ev, webContext) => { return window.sxl_user.fn6dff4efb11ab2eedbca9f29835365cfb(ev, webContext); })}>
                      Click to greet user
                  </button>);
      }
      "
    `);

    expect(
      validateTypeScriptCode(
        `declare global {
            interface Window { sxl_user: any; }
        }\n${transformed}`,
        tsConfig,
      ),
    ).toBeFalsy();

    const actions = extractor
      .getActionsPerFile()
      .map(([_, contents]) => contents)
      .join(";");
    expect(actions).toMatchInlineSnapshot(`
      "
      import { withClientData } from "lean-web-utils/server";
      type Arg = Parameters<typeof withClientData>[1]
      // file.tsx
      export const fn6dff4efb11ab2eedbca9f29835365cfb = (ev, webContext) => {
      alert(\`Hello \${webContext?.data.firstName}\`);
      };
      "
    `);

    expect(
      validateTypeScriptCode(
        `declare global {
        interface Window { sxl_user: any; }
    }\n${actions}`,
        tsConfig,
      ),
    ).toBeFalsy();
  });

  test("ts event extractor - large file", () => {
    const source = fs.readFileSync(
      path.resolve(
        "packages/core/tests/unit/plugins/esbuild/test-data/large-component.tsx",
      ),
      "utf8",
    );

    expect(
      validateTypeScriptCode(
        source,
        tsConfig,
        "packages/core/tests/unit/plugins/esbuild/test-data/large-component.tsx",
        [
          path.resolve(
            "packages/core/tests/unit/plugins/esbuild/test-data/extra-components.tsx",
          ),
        ],
      ),
    ).toBeFalsy();
    const transformed = extractor.fileTransformer(source);

    expect(transformed).toMatchSnapshot();

    expect(validateHandlersExist(transformed, extractor)).toBeTruthy();

    expect(
      validateTypeScriptCode(
        `declare global {
            interface Window { sxl_user: any; }
        }\n${transformed}`,
        tsConfig,
      ),
    ).toBeFalsy();

    const actions = extractor
      .getActionsPerFile()
      .map(([_, contents]) => contents)
      .join(";");
    expect(actions).toMatchSnapshot();

    expect(
      validateTypeScriptCode(
        `declare global {
        interface Window { sxl_user: any; }
    }\n${actions}`,
        tsConfig,
      ),
    ).toBeFalsy();
  });

  test("ts event extractor finds more event listeners besides onclick", () => {
    // notice onchange and onload have the exact same function,
    // so we only generate one handler for both:
    const source = `
      export function MyComponent() {
        return <button onclick={(c1) => c1} onchange={(c) => c} onload={(c) => c}>Click</button> 
      }
        `;

    expect(validateHandlersExist(source, extractor)).toBeTruthy();
    const transformed = extractor.fileTransformer(source);
    expect(validateHandlersExist(transformed, extractor)).toBeTruthy();

    expect(transformed).toMatchInlineSnapshot(`
      "export function MyComponent() {
          return <button onclick={(c1) => { return window.sxl_user.fnc811db883db9743ff5764cd85fb9d030(c1); }} onchange={(c) => { return window.sxl_user.fn65934597b0f8eb9debfc0762c97da7a6(c); }} onload={(c) => { return window.sxl_user.fn65934597b0f8eb9debfc0762c97da7a6(c); }}>Click</button>;
      }
      "
    `);

    expect(extractor.getActionsPerFile()).toMatchInlineSnapshot(`
      [
        [
          "file.tsx",
          "
      import { withClientData } from "lean-web-utils/server";
      type Arg = Parameters<typeof withClientData>[1]
      // file.tsx
      export const fnc811db883db9743ff5764cd85fb9d030 = (c1) => c1;
      export const fn65934597b0f8eb9debfc0762c97da7a6 = (c) => c;
      ",
        ],
      ]
    `);
  });

  test("we can skip processing short handlers", () => {
    extractor = new EventExtractor({ skipShortHandlers: true });
    const source = `
      export function MyComponent() {
        return <button onclick={(c1) => console.log('this is a long enough event handler')} onchange={(c) => c} onload={(c) => c}>Click</button> 
      }
        `;

    expect(validateHandlersExist(source, extractor)).toBeTruthy();
    const transformed = extractor.fileTransformer(source);
    expect(validateHandlersExist(transformed, extractor)).toBeTruthy();

    expect(transformed).toMatchInlineSnapshot(`
      "export function MyComponent() {
          return <button onclick={(c1) => { return window.sxl_user.fn8a6ef6b2b95f5134616d30c92a027aa6(c1); }} onchange={(c) => { return window.sxl_user.fn65934597b0f8eb9debfc0762c97da7a6(c); }} onload={(c) => { return window.sxl_user.fn65934597b0f8eb9debfc0762c97da7a6(c); }}>Click</button>;
      }
      "
    `);

    expect(extractor.getActionsPerFile()).toMatchInlineSnapshot(`
      [
        [
          "file.tsx",
          "
      import { withClientData } from "lean-web-utils/server";
      type Arg = Parameters<typeof withClientData>[1]
      // file.tsx
      export const fn8a6ef6b2b95f5134616d30c92a027aa6 = (c1) => console.log('this is a long enough event handler');
      export const fn65934597b0f8eb9debfc0762c97da7a6 = (c) => c;
      ",
        ],
      ]
    `);
  });
});
