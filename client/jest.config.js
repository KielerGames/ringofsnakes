/** @type {import("ts-jest/dist/types").InitialOptionsTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    testMatch: ["**/test/**/*.test.ts"],
    testTimeout: 1000,
    clearMocks: true,
    globals: {
        __DEBUG__: true,
        __TEST__: true,
        __VERSION__: "TEST VERSION"
    },
    collectCoverageFrom: [
        "**/src/app/**/*.{ts,tsx}",
        "!**/test/**",
        "!**/node_modules/**"
    ],
    errorOnDeprecated: true
};
