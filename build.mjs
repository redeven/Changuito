import { context, build } from "esbuild";
import { cp, rm } from "node:fs/promises";

const outdir = "dist";
const isWatchMode = process.argv.includes("--watch");

const buildOptions = {
  entryPoints: {
    background: "src/background/index.ts",
    content: "src/content/index.ts",
    popup: "src/popup/index.ts",
  },
  outdir,
  bundle: true,
  format: "iife",
  target: "firefox128",
  logLevel: "info",
};

await rm(outdir, { recursive: true, force: true });
await cp("static", outdir, { recursive: true });

if (isWatchMode) {
  const buildContext = await context(buildOptions);
  await buildContext.watch();
} else {
  await build(buildOptions);
}
