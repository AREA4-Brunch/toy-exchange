#!/usr/bin/env node

/**
 * Git Hooks Installation Script
 * Run this after cloning the repository to set up pre-commit formatting hooks
 * 
 * Usage: node commands/install-hooks.js
 */

const fs = require('fs');
const path = require('path');

const HOOKS_DIR = path.join(process.cwd(), '.git', 'hooks');
const PRE_COMMIT_HOOK = path.join(HOOKS_DIR, 'pre-commit');

const PRE_COMMIT_CONTENT = `#!/usr/bin/env node

// Pre-commit hook for all microservices formatting
const { execSync } = require('child_process');
const path = require('path');

try {
    // Run the formatting script
    execSync('node commands/pre-commit-format.js', { 
        stdio: 'inherit',
        cwd: path.resolve(__dirname, '../..')
    });
    process.exit(0);
} catch (error) {
    console.error('Pre-commit hook failed');
    process.exit(error.status || 1);
}`;

const installHooks = () => {
    console.log('🚀 Installing Git hooks for all microservices...\n');

    // Check if .git directory exists
    if (!fs.existsSync('.git')) {
        console.error('❌ Error: Not in a Git repository');
        console.error('   Please run this script from the project root');
        process.exit(1);
    }

    // Ensure hooks directory exists
    if (!fs.existsSync(HOOKS_DIR)) {
        fs.mkdirSync(HOOKS_DIR, { recursive: true });
    }

    // Install pre-commit hook
    try {
        fs.writeFileSync(PRE_COMMIT_HOOK, PRE_COMMIT_CONTENT);
        console.log('✅ Pre-commit hook installed');

        // Make executable on Unix-like systems
        if (process.platform !== 'win32') {
            const { execSync } = require('child_process');
            execSync(`chmod +x "${PRE_COMMIT_HOOK}"`);
            console.log('✅ Hook made executable');
        }

        console.log('\n🎉 Git hooks installed successfully!');
        console.log('\nHow it works:');
        console.log('• When you commit files, affected microservices will be auto-formatted');
        console.log('• Only microservices with staged files will be processed');
        console.log('• Files are re-staged after formatting');
        
        console.log('\nSupported microservices:');
        const config = require('./hooks.config.json');
        Object.entries(config.microservices).forEach(([path, info]) => {
            console.log(`  • ${path} (${info.type})`);
        });

        console.log('\nTo test: stage some files and run "git commit"');
        
    } catch (error) {
        console.error('❌ Failed to install hooks:', error.message);
        process.exit(1);
    }
};

if (require.main === module) {
    installHooks();
}

module.exports = { installHooks };
