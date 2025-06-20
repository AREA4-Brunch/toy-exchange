/**
 * Tuning strategy described here (found on 2025.06.11.):
 * https://www.ory.sh/blog/choose-recommended-argon2-parameters-password-hashing
 *
 * time for verification
 * parallelism = 2 * num_cores_for_hashing
 * key length (hash length) = 128 bits = 16 bytes
 * salt length = 128 bits = 16 bytes, if missing space can reduce to 8 bytes
 *
 *
 * Supports two operational modes:
 * - Memory search as powers of 2 (2^8, 2^9, etc.)
 * - Memory search as linear values (256, 512, 768, etc.)
 *
 * Two goal types:
 * - Target hashing duration (single hash operation)
 * - Target verification duration (hash + verify cycle)
 */

import {
    Argon2PasswordHasher,
    IArgon2PasswordHasherConfig,
} from '../infrastructure/argon2.password-hasher';
import { Argon2PasswordVerifier } from '../infrastructure/argon2.password-verifier';

const FALLBACK_MAX_MEM_KB_POWER_OF_2 = 20; // 1GB
const PARALLELISM = 2;
const HASH_LENGTH = 32; // in bytes

type GoalType = 'hash' | 'verify';
type SearchMode = 'power-of-2' | 'linear';

interface TuningConfig {
    targetDurationMs: number;
    goalType: GoalType;
    searchMode: SearchMode;
    maxMemoryKB?: number;
    testPassword: string;
    parallelism: number;
    hashLength: number;
}

interface TuningResult {
    config: IArgon2PasswordHasherConfig;
    actualDuration: number;
    hash: string;
    goalType: GoalType;
}

interface BenchmarkResult {
    duration: number;
    hash: string;
}

const main = async (): Promise<void> => {
    const tuningConfig = parseArguments();

    console.log(
        `🎯 Target: ${tuningConfig.targetDurationMs}ms ${tuningConfig.goalType} operation`,
    );
    console.log(`🔍 Search mode: ${tuningConfig.searchMode}`);
    console.log(`🔐 Test password: "${tuningConfig.testPassword}"\n`);

    const memoryResult = await findOptimalMemory(tuningConfig);
    console.log(
        `✅ Optimal memory: ${(memoryResult.config.memoryCost / 1024).toFixed(1)}MB\n`,
    );

    const finalResult = await findOptimalIterations(
        tuningConfig,
        memoryResult.config.memoryCost,
    );

    displayResults(memoryResult, finalResult);
    process.exit(0);
};

const parseArguments = (): TuningConfig => {
    const [
        ,
        ,
        target,
        mode = 'hash',
        searchType = 'power-of-2',
        maxMem,
        password,
    ] = process.argv;

    const targetDurationMs = parseInt(target);
    if (!targetDurationMs || targetDurationMs <= 0) {
        console.error(
            'Usage: npm run tune-argon2 <target-ms> [hash|verify] [power-of-2|linear] [max-memory-kb] [password]',
        );
        console.error('Examples:');
        console.error('  npm run tune-argon2 500 hash power-of-2');
        console.error('  npm run tune-argon2 1000 verify linear 262144');
        process.exit(1);
    }

    return {
        targetDurationMs,
        goalType: (mode === 'verify' ? 'verify' : 'hash') as GoalType,
        searchMode: (searchType === 'linear'
            ? 'linear'
            : 'power-of-2') as SearchMode,
        maxMemoryKB: maxMem ? parseInt(maxMem) : undefined,
        testPassword: password || 'test-password-123',
        parallelism: PARALLELISM,
        hashLength: HASH_LENGTH,
    };
};

// Generic binary search utility
const binarySearch = async <T>(
    left: number,
    right: number,
    epsilon: number,
    createCandidate: (value: number) => T,
    testPredicate: (
        candidate: T,
    ) => Promise<{ success: boolean; result?: any }>,
    shouldGoHigher: (testResult: any, target: any) => boolean,
): Promise<{ bestCandidate: T | null; bestResult: any | null }> => {
    let bestCandidate: T | null = null;
    let bestResult: any | null = null;

    while (right - left >= epsilon) {
        const mid = Math.floor((left + right) / 2);
        const candidate = createCandidate(mid);

        try {
            const { success, result } = await testPredicate(candidate);

            if (success) {
                bestCandidate = candidate;
                bestResult = result;

                if (shouldGoHigher(result, null)) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            } else {
                right = mid - 1;
            }
        } catch {
            right = mid - 1;
        }
    }

    return { bestCandidate, bestResult };
};

// Generic upper bound finder
const findUpperBound = async <T>(
    startValue: number,
    maxValue: number,
    increment: (current: number) => number,
    createCandidate: (value: number) => T,
    testPredicate: (
        candidate: T,
    ) => Promise<{ success: boolean; exceedsTarget: boolean }>,
): Promise<{ lowerBound: number; upperBound: number }> => {
    let current = startValue;
    let lastSuccessful = startValue;

    while (current <= maxValue) {
        const candidate = createCandidate(current);

        try {
            const { success, exceedsTarget } = await testPredicate(candidate);

            if (!success) break;
            if (exceedsTarget) break;

            lastSuccessful = current;
            current = increment(current);
        } catch {
            break;
        }
    }

    return { lowerBound: lastSuccessful, upperBound: current };
};

const benchmarkArgon2Config = async (
    password: string,
    config: IArgon2PasswordHasherConfig,
    goalType: GoalType,
    timeoutMs: number,
): Promise<BenchmarkResult> => {
    const hasher = new Argon2PasswordHasher(config);

    const performOperation = async (): Promise<BenchmarkResult> => {
        const start = Date.now();

        if (goalType === 'hash') {
            const hash = await hasher.hashPassword(password);
            return { duration: Date.now() - start, hash };
        } else {
            const hash = await hasher.hashPassword(password);
            const isValid = await new Argon2PasswordVerifier().verifyPassword(
                password,
                hash,
            );
            if (!isValid) throw new Error('Verification failed');
            return { duration: Date.now() - start, hash };
        }
    };

    return new Promise((resolve, reject) => {
        let completed = false;
        const timeout = setTimeout(() => {
            if (!completed) {
                completed = true;
                reject(new Error(`Operation timeout after ${timeoutMs}ms`));
            }
        }, timeoutMs);

        performOperation()
            .then((result) => {
                if (!completed) {
                    completed = true;
                    clearTimeout(timeout);
                    resolve(result);
                }
            })
            .catch((error) => {
                if (!completed) {
                    completed = true;
                    clearTimeout(timeout);
                    reject(error);
                }
            });
    });
};

const runMultipleBenchmarks = async (
    password: string,
    config: IArgon2PasswordHasherConfig,
    goalType: GoalType,
    timeoutMs: number,
    runs: number = 3,
): Promise<TuningResult> => {
    const results: BenchmarkResult[] = [];

    for (let i = 0; i < runs; i++) {
        const result = await benchmarkArgon2Config(
            password,
            config,
            goalType,
            timeoutMs,
        );
        results.push(result);
    }

    const averageDuration =
        results.reduce((sum, r) => sum + r.duration, 0) / results.length;

    return {
        config: { ...config },
        actualDuration: Math.round(averageDuration),
        hash: results[0].hash,
        goalType,
    };
};

const findOptimalMemory = async (
    tuningConfig: TuningConfig,
): Promise<TuningResult> => {
    const {
        targetDurationMs,
        goalType,
        searchMode,
        maxMemoryKB,
        testPassword,
        parallelism,
        hashLength,
    } = tuningConfig;
    const timeoutMs = targetDurationMs * 3;

    console.log(`🔍 Finding optimal memory (${searchMode} mode)...`);

    const createMemoryConfig = (
        memoryValue: number,
    ): IArgon2PasswordHasherConfig => ({
        type: undefined,
        memoryCost:
            searchMode === 'power-of-2'
                ? Math.pow(2, memoryValue)
                : memoryValue,
        timeCost: 1,
        parallelism,
        hashLength,
    });

    // Find upper bound
    const startValue = searchMode === 'power-of-2' ? 8 : 256; // 2^8 = 256KB
    const maxValue =
        searchMode === 'power-of-2'
            ? maxMemoryKB
                ? Math.log2(maxMemoryKB)
                : FALLBACK_MAX_MEM_KB_POWER_OF_2 // 1GB default
            : maxMemoryKB || Math.pow(2, FALLBACK_MAX_MEM_KB_POWER_OF_2); // 1GB

    const increment =
        searchMode === 'power-of-2'
            ? (current: number) => current + 1
            : (current: number) => current * 2;

    const { lowerBound, upperBound } = await findUpperBound(
        startValue,
        maxValue,
        increment,
        createMemoryConfig,
        async (config) => {
            try {
                const result = await runMultipleBenchmarks(
                    testPassword,
                    config,
                    goalType,
                    timeoutMs,
                    1,
                );
                const exceedsTarget = result.actualDuration > targetDurationMs;
                console.log(
                    `  ${(config.memoryCost / 1024).toFixed(1)}MB: ${result.actualDuration}ms ${exceedsTarget ? '(exceeded)' : ''}`,
                );
                return { success: true, exceedsTarget };
            } catch (error) {
                console.log(
                    `  ${(config.memoryCost / 1024).toFixed(1)}MB: Failed`,
                );
                return { success: false, exceedsTarget: true };
            }
        },
    );

    // Binary search for optimal memory
    const epsilon = searchMode === 'power-of-2' ? 1 : 64;
    const { bestResult } = await binarySearch(
        lowerBound,
        upperBound,
        epsilon,
        createMemoryConfig,
        async (config) => {
            try {
                const result = await runMultipleBenchmarks(
                    testPassword,
                    config,
                    goalType,
                    timeoutMs,
                );
                console.log(
                    `  ${(config.memoryCost / 1024).toFixed(1)}MB: ${result.actualDuration}ms`,
                );
                return {
                    success: result.actualDuration <= targetDurationMs,
                    result,
                };
            } catch {
                return { success: false };
            }
        },
        () => true, // Always try higher memory when within target
    );

    return (
        bestResult
        || (await runMultipleBenchmarks(
            testPassword,
            createMemoryConfig(lowerBound),
            goalType,
            timeoutMs,
        ))
    );
};

const findOptimalIterations = async (
    tuningConfig: TuningConfig,
    memoryCost: number,
): Promise<TuningResult> => {
    const {
        targetDurationMs,
        goalType,
        testPassword,
        parallelism,
        hashLength,
    } = tuningConfig;
    const timeoutMs = targetDurationMs * 3;

    console.log('🔧 Fine-tuning iterations...');

    let bestResult: TuningResult | null = null;
    let bestDifference = Infinity;

    for (let iterations = 1; iterations <= 50; iterations++) {
        const config: IArgon2PasswordHasherConfig = {
            type: undefined,
            memoryCost,
            timeCost: iterations,
            parallelism,
            hashLength,
        };

        try {
            const result = await runMultipleBenchmarks(
                testPassword,
                config,
                goalType,
                timeoutMs,
            );
            const difference = Math.abs(
                result.actualDuration - targetDurationMs,
            );

            console.log(
                `  ${iterations} iter: ${result.actualDuration}ms (diff: ${difference}ms)`,
            );

            if (difference < bestDifference) {
                bestDifference = difference;
                bestResult = result;
            }

            if (result.actualDuration > targetDurationMs) break;
        } catch {
            break;
        }
    }

    return bestResult!;
};

const displayResults = (
    memoryResult: TuningResult,
    finalResult: TuningResult,
) => {
    const { config } = finalResult;

    console.log('\n🎉 OPTIMAL CONFIGURATION');
    console.log('========================');
    console.log(`Goal: ${finalResult.goalType} operation`);
    console.log(
        `Memory: ${(config.memoryCost / 1024).toFixed(1)}MB (${config.memoryCost}KB)`,
    );
    console.log(`Iterations: ${config.timeCost}`);
    console.log(`Parallelism: ${config.parallelism}`);
    console.log(`Hash Length: ${config.hashLength} bytes`);
    console.log(`Duration: ${finalResult.actualDuration}ms`);

    console.log('\n📝 Configuration:');
    console.log('```typescript');
    console.log('const config: IArgon2PasswordHasherConfig = {');
    console.log('    type: argon2.argon2id,');
    console.log(`    memoryCost: ${config.memoryCost},`);
    console.log(`    timeCost: ${config.timeCost},`);
    console.log(`    parallelism: ${config.parallelism},`);
    console.log(`    hashLength: ${config.hashLength}`);
    console.log('};');
    console.log('```');
};

if (require.main === module) {
    main();
}
