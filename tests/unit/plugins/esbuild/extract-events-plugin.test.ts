import { describe, test } from "@jest/globals";
import { HandlersPluginTester } from "./plugin-tester";
import fs from "fs";
import path from "path";

describe("extract-events-plugin", () => {
  test("test plugin", async () => {
    const { handlersCode, componentsCode, writtenFiles } =
      await new HandlersPluginTester().testExtractEventsPlugin({
        "file.tsx": `
    export function MyComponent() {
      return <button onclick={(ev) => console.log(ev)}>Click</button> 
    }
      `,
        "file2.tsx": `
        export function MyComponent2() {
            return <div>Hello</div>
        }
      `,
        "file3.tsx": `
        export function MyComponent3() {
            return <button onclick={(c1) => c1} onchange={(c) => c} onload={(c) => c}>Click</button> 
          }
      `,
      });
    expect(fs.promises.readFile).toHaveBeenCalledWith(
      "file.tsx",
      expect.any(String),
    );

    if (!handlersCode || !handlersCode.outputFiles) {
      throw new Error("Missing esbuild result");
    }

    expect(handlersCode.outputFiles[0].text).toMatchSnapshot();

    expect(
      Object.entries(writtenFiles).map(([fpath, contents]) => [
        path.relative(process.cwd(), fpath),
        contents,
      ]),
    ).toMatchSnapshot();

    expect(componentsCode.map((c) => c.contents).join("\n")).toMatchSnapshot();
  });

  test("test plugin - simulate rebuild", async () => {
    const tester = new HandlersPluginTester();
    const { handlersCode, componentsCode, writtenFiles } =
      await tester.testExtractEventsPlugin({
        "file.tsx": `
    export function MyComponent() {
      return <button onclick={(ev) => console.log(ev)}>Click</button> 
    }
      `,
        "file2.tsx": `
        export function MyComponent2() {
            return <div>Hello</div>
        }
      `,
      });
    expect(fs.promises.readFile).toHaveBeenCalledWith(
      "file.tsx",
      expect.any(String),
    );

    if (!handlersCode || !handlersCode.outputFiles) {
      throw new Error("Missing esbuild result");
    }

    expect(handlersCode.outputFiles?.map((f) => f.text)).toMatchSnapshot();

    expect(
      Object.entries(writtenFiles).map(([fpath, contents]) => [
        path.relative(process.cwd(), fpath),
        contents,
      ]),
    ).toMatchSnapshot();

    expect(componentsCode.map((c) => c.contents).join("\n")).toMatchSnapshot();

    // rebuild:

    const rebuildResults = await tester.testExtractEventsPlugin({
      "file.tsx": `
    export function MyComponent() {
      return <button onclick={(ev1) => console.log(ev1)}>Click</button> 
    }`,
    });

    expect(
      rebuildResults.handlersCode?.outputFiles?.map((f) => f.text),
    ).toMatchSnapshot("rebuild handlers code");

    expect(
      Object.entries(writtenFiles).map(([fpath, contents]) => [
        path.relative(process.cwd(), fpath),
        contents,
      ]),
    ).toMatchSnapshot("rebuild written files");

    expect(componentsCode.map((c) => c.contents).join("\n")).toMatchSnapshot(
      "rebuild components code",
    );
  });
});
