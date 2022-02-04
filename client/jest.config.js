/** @type {import("ts-jest/dist/types").InitialOptionsTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    testMatch: ["**/test/**/*.test.ts"],
    testTimeout: 1000,
    globals: {
        __DEBUG__: true
    }
};
