// @ts-check

import { build } from "esbuild";
import {
    readFileSync,
    writeFile,
    watch,
    watchFile,
    mkdirSync,
    existsSync,
    writeFileSync,
} from "fs";
import { generateDtsBundle } from "dts-bundle-generator";
import crypto from "crypto";
import glob from "fast-glob";

const outdir = "lib";
const packageJSON = JSON.parse(readFileSync("./package.json", "utf-8"));

/**
 * NodeJS, server-side dependencies:
 */
const cjsInput = [
    "src/lib/plugins/vite.ts",
    "src/lib/server.ts",
    "src/lib/server/components.ts",
    "src/lib/plugins/esbuild.ts",
];

const esInput = [
    "src/lib/plugins/vite.ts",
    "src/lib/server.ts",
    "src/lib/server/components.ts",
    "src/lib/plugins/esbuild.ts",
];

const tsInput = [
    //   "src/plugins/vite.ts",
    "src/lib/server.ts",
    "src/lib/server/components.ts",
    "src/lib/plugins/esbuild.ts",
];

/**
 * Browser-side dependencies
 */
const iifeInput = {
    "web/sxl": "./src/web/index.ts",
};

/**
 * @type import("esbuild").BuildOptions
 */
const commonConfig = {
    bundle: true,
    platform: "node",
    sourcemap: false,
    target: "node12",
    outdir,
    external: [
        ...Object.keys(packageJSON.dependencies ?? {}),
        "esbuild",
        "lean-jsx/web/sxl.js",
    ],
    plugins: [],
};

/** @type import('dts-bundle-generator/config-schema').OutputOptions */
const commonOutputParams = {
    inlineDeclareGlobals: false,
    sortNodes: true,
};

function generateChecksum(str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || "md5")
        .update(str, "utf8")
        .digest(encoding || "hex");
}

async function main() {
    await Promise.all([
        build({
            entryPoints: cjsInput,
            format: "cjs",
            outdir,
            outExtension: { ".js": ".cjs" },
            resolveExtensions: [".cjs.ts", ".ts", ".js", ".tsx"],
            ...commonConfig,
        }).catch(() => process.exit(1)),
        build({
            entryPoints: esInput,
            format: "esm",
            outExtension: { ".js": ".js" },
            outdir,
            resolveExtensions: [".esm.ts", ".ts", ".js", ".tsx"],
            ...commonConfig,
        }).catch(() => process.exit(1)),
        build({
            entryPoints: iifeInput,
            bundle: true,
            format: "iife",
            globalName: "sxl",
            outdir,
            external: [
                // ...Object.keys(packageJSON.dependencies ?? {}),
                "esbuild",
                "lean-jsx/web/sxl.js",
            ],
            plugins: [],
        }).catch(() => process.exit(1)),
        buildTypes(),
    ]);

    //   });

    console.log("Build complete!");
}

main();

async function checkSumValidation() {
    mkdirSync(".tmp/", { recursive: true });
    const checksumPath = ".tmp/build_sums.json";

    const files = await glob.glob("lib/**/*.js");
    files.sort();
    const currentSums = JSON.stringify(
        files.map((file) => [
            file,
            generateChecksum(readFileSync(file, "utf-8")),
        ]),
    );

    let buildSums = "";
    if (existsSync(checksumPath)) {
        buildSums = readFileSync(checksumPath, "utf-8");
    }

    if (buildSums === currentSums) {
        return;
    }

    // writeFileSync(checksumPath, currentSums);
}

async function buildTypes() {
    return new Promise((resolve) => {
        console.log("Generating types...");
        const bundle = generateDtsBundle(
            tsInput.map((filePath) => ({
                filePath,
                noCheck: true,
                output: {
                    inlineDeclareGlobals: false,
                    exportReferencedTypes: true,
                },
                minify: false,
                libraries: {
                    importedLibraries: [
                        "node",
                        "jest",
                        "express",
                        "vite",
                        "lean-jsx-types/global",
                    ],
                    allowedTypesLibraries: [
                        "node",
                        "jest",
                        "express",
                        "vite",
                        "lean-jsx-types/global",
                    ],
                    //   inlinedLibraries: ["lean-web-utils/server"],
                },
                //   output: filePath.replaceAll("src/lib", outdir).replaceAll(".ts", ".d.ts"),
            })),
            {
                followSymlinks: true,
                preferredConfigPath: "./tsconfig.json",
            },
        );

        bundle.forEach((code, ind) => {
            const filePath = tsInput[ind];
            const outPath = filePath
                // @ts-ignore
                .replaceAll("src/lib", outdir)
                .replaceAll(".ts", ".d.ts");
            console.log(`Saving ${outPath}...`);
            writeFile(outPath, code, (err) => (err ? console.error(err) : ""));
        });
        resolve(true);
    });
}
