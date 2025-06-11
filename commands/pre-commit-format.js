#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Pre-commit formatter for all microservices
 * Detects affected microservices and runs their formatting commands
 */
const loadMicroserviceConfig = () => {
    try {
        const configPath = path.join(__dirname, 'hooks.config.json');
        const configData = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configData);
        return config.microservices;
    } catch (error) {
        console.error('❌ Failed to load hooks config:', error.message);
        console.error('   Using fallback configuration...');

        // Fallback configuration
        return {
            'src/backend/authentication': { command: 'npm run format', type: 'node' },
            'src/backend/shared/authorization': { command: 'npm run format', type: 'node' },
            'src/backend/shared/common': { command: 'npm run format', type: 'node' },
            'src/backend/shared/password-utils': { command: 'npm run format', type: 'node' },
            'test/authentication': { command: 'npm run format', type: 'node' },
        };
    }
};

const MICROSERVICE_CONFIGS = loadMicroserviceConfig();

const getStagedFiles = () => {
    try {
        const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
        return output.trim().split('\n').filter(Boolean);
    } catch (error) {
        console.error('❌ Failed to get staged files:', error.message);
        return [];
    }
};

const findAffectedMicroservices = (stagedFiles) => {
    const affected = new Set();

    for (const file of stagedFiles) {
        // Normalize path separators for cross-platform compatibility
        const normalizedFile = file.replace(/\\/g, '/');

        // Find which microservice this file belongs to
        for (const [servicePath, config] of Object.entries(MICROSERVICE_CONFIGS)) {
            if (normalizedFile.startsWith(servicePath + '/')) {
                affected.add(servicePath);
                break;
            }
        }
    }

    return Array.from(affected);
};

const formatMicroservice = (servicePath) => {
    const config = MICROSERVICE_CONFIGS[servicePath];
    const absolutePath = path.resolve(servicePath);

    console.log(`🎨 Formatting ${config.type} microservice: ${servicePath}`);
    console.log(`   Command: ${config.command}`);

    try {
        execSync(config.command, { 
            cwd: absolutePath, 
            stdio: 'inherit',
            timeout: 60000 // 60 second timeout
        });
        console.log(`✅ Successfully formatted: ${servicePath}`);
        return true;
    } catch (error) {
        console.error(`❌ Format failed in ${servicePath}:`);
        console.error(`   Error: ${error.message}`);
        return false;
    }
};

const restageFiles = (stagedFiles) => {
    try {
        // Re-stage all originally staged files (they may have been formatted)
        const filesToStage = stagedFiles.map(f => `"${f}"`).join(' ');
        execSync(`git add ${filesToStage}`, { stdio: 'inherit' });
        console.log('📝 Files re-staged after formatting');
        return true;
    } catch (error) {
        console.error('❌ Failed to re-stage files:', error.message);
        return false;
    }
};

const main = () => {
    console.log('🚀 Pre-commit formatting hook started...\n');

    const stagedFiles = getStagedFiles();

    if (stagedFiles.length === 0) {
        console.log('ℹ️  No staged files found');
        process.exit(0);
    }

    console.log(`📁 Found ${stagedFiles.length} staged files`);

    const affectedMicroservices = findAffectedMicroservices(stagedFiles);

    if (affectedMicroservices.length === 0) {
        console.log('ℹ️  No microservices affected by staged changes');
        process.exit(0);
    }

    console.log(`🎯 Affected microservices (${affectedMicroservices.length}):`);
    affectedMicroservices.forEach(service => {
        const config = MICROSERVICE_CONFIGS[service];
        console.log(`   • ${service} (${config.type})`);
    });
    console.log();

    // Format each affected microservice
    let allSuccessful = true;
    for (const servicePath of affectedMicroservices) {
        if (!formatMicroservice(servicePath)) {
            allSuccessful = false;
            break;
        }
        console.log(); // Add spacing between services
    }

    if (!allSuccessful) {
        console.error('💥 Formatting failed - commit aborted');
        process.exit(1);
    }

    // Re-stage files after formatting
    if (!restageFiles(stagedFiles)) {
        console.error('💥 Failed to re-stage files - commit aborted');
        process.exit(1);
    }

    console.log('🎉 All microservices formatted successfully!');
    console.log('✨ Commit can proceed...\n');
};


if (require.main === module) {
    main();
}
