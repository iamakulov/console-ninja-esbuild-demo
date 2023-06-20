const { context } = require("esbuild");
const path = require("path");
const { fileURLToPath } = require("url");
const { appBuildPlugin } = require("./appBuildPlugin");

const isProduction = true;

const commonConfig = {
  outdir: path.resolve(__dirname, "../build"),
  bundle: true,
  target: "es2019",
  format: "esm",
  splitting: true,
  minify: isProduction,
  logLevel: "info",
  loader: {
    ".ejs": "text",
    ".raw.tsx": "text",
    ".tmLanguage": "text",
    ".png": "file",
    ".svg": "file",
    ".ttf": "file",
    ".mp4": "file",
    ".jpg": "file",
    ".woff": "file",
    ".woff2": "file",
  },
  external: ["https"],
  sourcemap: true,
  define: {
    "process.env.BUILD_TYPE": isProduction ? "'production'" : "'development'",
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development"
    ),
    // Mock: simulate the webpack behavior for bad libs like fbjs
    global: "window",
  },
};

const appEntrypoints = {
  a: path.resolve(__dirname, "../src/a"),
  b: path.resolve(__dirname, "../src/b"),
  c: path.resolve(__dirname, "../src/c"),
};

// App entrypoints
async function appBuild() {
  return context({
    ...commonConfig,
    entryPoints: appEntrypoints,
    entryNames: `[name]`,
    metafile: true,
    logLevel: "info",
    publicPath: "/build/",
    tsconfig: path.resolve(__dirname, "../tsconfig.json"),
    plugins: [appBuildPlugin],
  });
}

async function monacoBuild() {
  return context({
    ...commonConfig,
    entryPoints: [
      "monaco-editor/esm/vs/editor/editor.worker.js",
      "monaco-editor/esm/vs/language/typescript/ts.worker.js",
      "monaco-editor/esm/vs/language/json/json.worker.js",
      "monaco-editor/esm/vs/language/html/html.worker.js",
    ],
    entryNames: `[name].[hash]`,
    minify: true,
    format: "iife",
    splitting: false,
  });
}

async function buildOrWatchContext(esbuildContext) {
  const isWatchMode = Boolean(
    JSON.parse(process.env.ENABLE_WATCH_MODE || "false")
  );
  if (isWatchMode) {
    return esbuildContext.watch();
  } else {
    // Build once then dispose
    await esbuildContext.rebuild();
    return esbuildContext.dispose();
  }
}

// Main
(async () => {
  await Promise.all(
    [await appBuild(), await monacoBuild()].map(buildOrWatchContext)
  );
})();
