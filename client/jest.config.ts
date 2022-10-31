import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    verbose: true,
    testMatch: ["**/test/**/*.test.ts"],
    testTimeout: 1000,
    clearMocks: true,
    globals: {
        __DEBUG__: true,
        __TEST__: true,
        __VERSION__: "TEST VERSION"
    },
    collectCoverageFrom: ["**/src/app/**/*.{ts,tsx}", "!**/test/**", "!**/node_modules/**"],
    errorOnDeprecated: true
};

export default config;
