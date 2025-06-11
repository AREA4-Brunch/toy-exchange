import fg from 'fast-glob';

export const findFilesByPattern = (
    pattern: string,
    rootDir: string,
    ignorePatterns: string[] = [],
): string[] => {
    try {
        const results = fg.sync(pattern, {
            cwd: rootDir,
            ignore: ignorePatterns,
            onlyFiles: true, // Only return files, not directories
        });

        console.log(`🔍 Pattern: ${pattern} found ${results.length} files`);
        return results;
    } catch (error) {
        console.error(`❌ Error finding files with pattern ${pattern}:`, error);
        return [];
    }
};
