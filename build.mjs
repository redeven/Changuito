import { context, build } from 'esbuild';
import { cp, readFile, rm, writeFile } from 'node:fs/promises';

const targetArgument = process.argv.find((argument) => argument.startsWith('--target='));
const target = targetArgument?.slice('--target='.length) ?? 'all';
const isWatchMode = process.argv.includes('--watch');

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));

const userscriptMetadata = [
  ['name', 'Changuito para Steam'],
  ['namespace', 'https://github.com/redeven/Changuito'],
  ['version', packageJson.version],
  ['description', packageJson.description],
  ['icon', 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f9c9/emoji.svg'],
  ['license', packageJson.license],
  ['match', 'https://store.steampowered.com/*'],
  ['match', 'https://steamcommunity.com/app/*'],
  ['run-at', 'document-idle'],
  ['grant', 'GM.getValue'],
  ['grant', 'GM.setValue'],
  ['grant', 'GM.xmlHttpRequest'],
  ['grant', 'GM.registerMenuCommand'],
  ['grant', 'GM_addValueChangeListener'],
  ['connect', 'mercados.ambito.com'],
];

const userscriptBanner = [
  '// ==UserScript==',
  ...userscriptMetadata.map(([key, value]) => `// @${key.padEnd(12)} ${value}`),
  '// ==/UserScript==',
].join('\n');

const targets = {
  firefox: {
    outdir: 'dist',
    prepare: async () => {
      await cp('static', 'dist', { recursive: true });
      const manifest = await readFile('dist/manifest.json', 'utf8');
      await writeFile('dist/manifest.json', manifest.replace('__CHANGUITO_VERSION__', packageJson.version));
    },
    options: {
      entryPoints: {
        background: 'src/background/index.ts',
        content: 'src/content/index.ts',
        popup: 'src/popup/index.ts',
      },
      outdir: 'dist',
      alias: { '#platform': './src/platform/webext.ts' },
      target: 'firefox140',
    },
  },
  userscript: {
    outdir: 'dist-userscript',
    prepare: async () => {},
    options: {
      entryPoints: ['src/userscript/index.ts'],
      outfile: 'dist-userscript/changuito.user.js',
      alias: { '#platform': './src/platform/userscript.ts' },
      target: 'es2022',
      loader: { '.css': 'text', '.svg': 'text' },
      define: { __CHANGUITO_VERSION__: JSON.stringify(packageJson.version) },
      banner: { js: userscriptBanner },
    },
  },
};

const selectedTargets = target === 'all' ? Object.keys(targets) : [target];
for (const name of selectedTargets) {
  if (!targets[name])
    throw new Error(`Destino desconocido "${name}". Opciones: all, ${Object.keys(targets).join(', ')}`);
}

for (const name of selectedTargets) {
  const { outdir, prepare, options } = targets[name];
  const buildOptions = { ...options, bundle: true, format: 'iife', logLevel: 'info' };

  await rm(outdir, { recursive: true, force: true });
  await prepare();

  if (isWatchMode) {
    const buildContext = await context(buildOptions);
    await buildContext.watch();
  } else {
    await build(buildOptions);
  }
}
