import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    verbose: true,
    testMatch: ["**/test/**/*.test.ts"],
    testTimeout: 1000,
    clearMocks: true,
    globals: {
        __DEBUG__: true,
        __TEST__: true,
        __VERSION__: "TEST VERSION",
        __GAME_SERVER__: "ws://127.0.0.1:8080/test",
    },
    collectCoverageFrom: ["**/src/app/**/*.{ts,tsx}", "!**/test/**", "!**/node_modules/**"],
    errorOnDeprecated: true
};

export default config;
