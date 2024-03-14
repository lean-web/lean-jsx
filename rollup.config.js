const typescript = require("@rollup/plugin-typescript");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const json = require("@rollup/plugin-json");
const { dts } = require("rollup-plugin-dts");
const alias = require("rollup-plugin-alias");
const packageJSON = require("./package.json");
const analyze = require("rollup-plugin-analyzer");
const { visualizer } = require("rollup-plugin-visualizer");
const terser = require("@rollup/plugin-terser");

const { dependencies } = packageJSON;

const compact = false;

const analyzeConf = {
  showExports: true,
};

/**
 * NodeJS, server-side dependencies:
 */
const cjsInput = {
  server: "src/server/express.ts",
  "server/components": "src/components/index.tsx",
  "plugins/vite": "./src/plugins/vite.ts",
  "plugins/esbuild": "./src/plugins/esbuild.ts",
  "jsx/jsx-dev-runtime": "./src/jsx/core/jsx-dev-runtime.ts",
  "jsx/jsx-runtime": "./src/jsx/core/jsx-runtime.ts",
};

const esInput = {
  "plugins/vite": "./src/plugins/vite.ts",
  "plugins/esbuild": "./src/plugins/esbuild.ts",
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
  "lean-jsx/web/sxl.js",
  "body-parser",
  "pino",
  "pino-http",
  "raw-body",
  "express",
  "compression",
  "stream",
  "esbuild",
  "typescript",
  "fs",
  "crypto",
  "lean-jsx-types/context",
  "lean-web-utils/server",
  ...Object.keys(dependencies),
];

/**
 * Alias (as configured in tsconfig.json)
 */
const aliasConfig = alias({
  "@/": ["./src/"],
  "@/*": ["./src/*"],
});

const tsConfig = typescript({
  exclude: ["tests/**"],
  noEmit: true,
});

const buildPlugins = (filename, minify = false) => {
  const plugins = [
    tsConfig,
    nodeResolve({ preferBuiltins: true }),
    commonjs(),
    json(),
    aliasConfig,
    // analyze(analyzeConf),
    visualizer({
      emitFile: true,
      open: true,
      filename,
    }),
  ];

  if (minify) {
    plugins.push(terser({ maxWorkers: 4 }));
  }

  return plugins;
};

const dtsPlugins = (filename, minify = false) => {
  const plugins = [
    typescript({
      exclude: ["tests/**"],
    }),
    dts(),
    // analyze(analyzeConf),
    visualizer({
      emitFile: true,
      open: true,
      filename,
    }),
  ];

  if (minify) {
    plugins.push(terser({ maxWorkers: 4 }));
  }

  return plugins;
};

module.exports = [
  {
    input: cjsInput,
    output: {
      dir: "lib",
      format: "cjs",
      entryFileNames: "[name].js",
      chunkFileNames: "includes/[hash].js",
      compact,
    },
    plugins: buildPlugins("stats_cjs.html"),
    external,
  },
  {
    input: esInput,
    output: {
      dir: "lib",
      format: "es",
      entryFileNames: "[name].mjs",
      chunkFileNames: "includes/[hash].mjs",
      compact,
    },
    plugins: buildPlugins("stats_esm.html"),
    external,
  },
  // Generate .d.ts files:
  {
    input: cjsInput,
    output: {
      dir: "lib",
      format: "es",
      entryFileNames: "[name].d.ts",
      compact,
    },
    plugins: dtsPlugins("stats_dts.html"),
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
      compact,
    },
    plugins: buildPlugins("stats_iife.html", true),
    external,
  },
];
