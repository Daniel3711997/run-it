const esbuild = require('esbuild'); // eslint-disable-line @typescript-eslint/no-require-imports

const watch = process.argv.includes('--watch');
const production = process.argv.includes('--production');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
    name: 'esbuild-problem-matcher',

    setup(build) {
        build.onStart(() => {
            console.log('[watch] build started');
        });

        build.onEnd(result => {
            result.errors.forEach(({ location, text }) => {
                console.error(`✘ [ERROR] ${text}`);
                console.error(`    ${location.file}:${location.line}:${location.column}:`);
            });
            console.log('[watch] build finished');
        });
    },
};

async function main() {
    const ctx = await esbuild.context({
        bundle: true,
        entryPoints: ['src/extension.ts'],
        external: ['vscode'],
        format: 'cjs',
        logLevel: 'silent',
        minify: production,
        outfile: 'dist/extension.js',
        platform: 'node',
        plugins: [esbuildProblemMatcherPlugin],
        sourcemap: !production,
        sourcesContent: false,
    });

    if (watch) {
        await ctx.watch();
    } else {
        await ctx.rebuild();
        await ctx.dispose();
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
