const typescript = require("@rollup/plugin-typescript");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const json = require("@rollup/plugin-json");
const { dts } = require("rollup-plugin-dts");
const alias = require("rollup-plugin-alias");

/**
 * NodeJS, server-side dependencies:
 */
const cjsInput = {
  server: "src/server/express.ts",
  "server/components": "src/components/index.tsx",
  "plugins/vite": "./src/plugins/vite/index.ts",
  "jsx/jsx-dev-runtime": "./src/jsx/core/jsx-dev-runtime.ts",
  "jsx/jsx-runtime": "./src/jsx/core/jsx-runtime.ts",
};

/**
 * Browser-side dependencies
 */
const iifeInput = {
  "web/sxl": "./src/web/index.ts",
};

/**
 * External dependencies:
 */
const external = [
  "lean-jsx/lib/web/sxl.js",
  "body-parser",
  "pino",
  "raw-body",
  "express",
  "compression",
  "stream",
];

/**
 * Alias (as configured in tsconfig.json)
 */
const aliasConfig = alias({
  "@/": ["./src/"],
  "@/*": ["./src/*"],
});

module.exports = [
  {
    input: cjsInput,
    output: {
      dir: "lib",
      format: "cjs",
      entryFileNames: "[name].js",
    },
    plugins: [
      typescript({
        exclude: ["tests/**"],
        noEmit: true,
      }),
      nodeResolve({ preferBuiltins: true }),
      commonjs(),
      json(),
      aliasConfig,
    ],
    external,
  },
  // Generate .d.ts files:
  {
    input: cjsInput,
    output: {
      dir: "lib",
      format: "es",
      entryFileNames: "[name].d.ts",
    },
    plugins: [
      typescript({
        exclude: ["tests/**"],
      }),
      dts(),
    ],
    external,
  },
  {
    input: {
      global: "src/types/global.ts",
      context: "src/types/context.ts",
    },
    output: {
      dir: "lib",
      format: "es",
      entryFileNames: "[name].d.ts",
    },
    plugins: [
      typescript({
        exclude: ["tests/**"],
        noEmit: false,
      }),
      dts(),
    ],
    external,
  },
  // generate browser dependencies:
  {
    input: iifeInput,
    output: {
      dir: "lib",
      format: "iife",
      entryFileNames: "[name].js",
      name: "sxl",
    },
    plugins: [
      typescript({
        exclude: ["tests/**"],
        noEmit: true,
      }),
      nodeResolve({ preferBuiltins: true }),
      commonjs(),
      json(),
      aliasConfig,
    ],
    external,
  },
];
