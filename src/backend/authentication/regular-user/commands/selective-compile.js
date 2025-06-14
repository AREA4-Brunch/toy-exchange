/**
 * JS file so it itself would not require compilation.
 */

const { selectiveCompile } = require('common/dist/commands/selective-compile');
const path = require('path');

async function main() {
    const command = process.argv[2];
    const projectRoot = path.resolve(__dirname, '../../');

    try {
        switch (command) {
            case 'commands':
                console.log('🎯 Compiling commands only...');
                await selectiveCompile({
                    projectRoot,
                    selectiveFiles: ['regular-user/commands/**/*'],
                    ignorePatterns: ['node_modules/**', 'dist/**'],
                    outputDir: './dist',
                    cleanupAfter: true,
                    tsConfigTemplate: {
                        compilerOptions: {
                            outDir: './dist',
                            declaration: true,
                            emitDeclarationOnly: false,
                        },
                    },
                });
                break;

            default:
                console.log(`❗ Unknown command: ${command}`);
                break;
        }
    } catch (error) {
        console.error('❌ Compilation failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
