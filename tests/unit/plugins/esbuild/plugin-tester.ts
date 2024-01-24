import type {
  BuildOptions,
  BuildResult,
  OnEndResult,
  OnLoadArgs,
  OnLoadOptions,
  OnLoadResult,
  PluginBuild,
} from "esbuild";

function defer<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
} {
  let res: ((value: T) => void) | undefined;

  const p = new Promise<T>((resolve) => {
    res = resolve;
  });

  return {
    promise: p,
    resolve: res as (value: T) => void,
  };
}

jest.mock("fs", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const actualFs = jest.requireActual<typeof import("fs")>("fs");

  return {
    ...actualFs,
    readFileSync: jest.fn(),
    writeFileSync: jest.fn().mockImplementation(() => {}),
    existsSync: jest.fn().mockReturnValue(true),
    readdirSync: jest.fn().mockReturnValue([]),
    mkdirSync: jest.fn(),
    promises: {
      ...actualFs.promises,
      writeFile: jest.fn().mockReturnValue(Promise.resolve()),
      readFile: jest.fn().mockReturnValue(Promise.resolve("File1")),
    },
    // Mock other fs methods as needed
  };
});

jest.mock("fast-glob", () => ({
  sync: jest.fn(),
}));

import esbuild from "esbuild";
import fs from "fs";
import fg from "fast-glob";
import extractEventHandlersPlugin from "@/plugins/esbuild";

type SourcePath = string;
type SourceCode = string;

export class HandlersPluginTester {
  writtenFiles: Record<SourcePath, SourceCode> = {};
  readFiles: Array<string> = [];

  async testExtractEventsPlugin(sourceCode: Record<SourcePath, SourceCode>) {
    const writtenFiles = this.writtenFiles;
    const readFiles = this.readFiles;

    (fs.writeFileSync as jest.Mock).mockImplementation(
      (path: string, file: string) => {
        writtenFiles[path] = file;
      },
    );

    (fg.sync as jest.Mock).mockImplementation(() => {
      return Object.keys(writtenFiles)
        .filter((path) => path.includes(".lean/handlers"))
        .map((path) => path);
    });

    (fs.promises.writeFile as jest.Mock).mockImplementation(
      (path: string, file: string) => {
        writtenFiles[path] = file;
        return Promise.resolve();
      },
    );

    (fs.promises.readFile as jest.Mock).mockImplementation((path: string) => {
      readFiles.push(path);

      if (writtenFiles[path]) {
        return Promise.resolve(writtenFiles[path]);
      }

      return Promise.resolve(sourceCode[path]);
    });

    const deferred = defer<OnLoadResult[]>();
    let endCallback:
      | ((
          result: BuildResult<BuildOptions>,
        ) => void | OnEndResult | Promise<void | OnEndResult | null> | null)
      | undefined;

    let handlersCode: esbuild.BuildResult | undefined;

    const _build: Pick<PluginBuild, "onLoad" | "onEnd" | "esbuild"> = {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onLoad: async function (
        options: OnLoadOptions,
        callback: (
          args: OnLoadArgs,
        ) =>
          | OnLoadResult
          | Promise<OnLoadResult | null | undefined>
          | null
          | undefined,
      ): Promise<void> {
        // throw new Error("Function not implemented.");

        const onLoadResults = await Promise.all(
          Object.keys(sourceCode).map((fileName) =>
            callback({
              path: fileName,
              namespace: "",
              suffix: "",
              pluginData: undefined,
            }),
          ),
        );

        deferred.resolve(
          onLoadResults.filter((res): res is esbuild.OnLoadResult => !!res),
        );
      },
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onEnd: function (
        callback: (
          result: BuildResult<BuildOptions>,
        ) => void | OnEndResult | Promise<void | OnEndResult | null> | null,
      ): void {
        endCallback = callback;
      },
      esbuild: {
        ...esbuild,
        build: async (
          options: esbuild.BuildOptions,
        ): Promise<esbuild.BuildResult> => {
          handlersCode = await esbuild.build({ ...options, write: false });
          return handlersCode;
        },
      },
    };

    await extractEventHandlersPlugin.setup(_build as PluginBuild);
    const componentsCode = await deferred.promise;

    if (!endCallback) {
      throw new Error("Callback should be present");
    }

    await endCallback({
      errors: [],
      warnings: [],
      outputFiles: undefined,
      metafile: undefined,
      mangleCache: undefined,
    });

    return { writtenFiles, readFiles, handlersCode, componentsCode };
  }
}
