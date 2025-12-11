const nextJest = require("next/jest")

const createJestConfig = nextJest({
    dir: "./"
})

const customJestConfig = {
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    testEnvironment: "jest-environment-jsdom",
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
        "^@presentation/(.*)$": "<rootDir>/src/presentation/$1",
        "^@domain/(.*)$": "<rootDir>/src/domain/$1",
        "^@data/(.*)$": "<rootDir>/src/data/$1"
    },
    testMatch: ["<rootDir>/test/**/*.(spec|test).[jt]s?(x)"],
    collectCoverageFrom: [
        "src/**/*.{js,jsx,ts,tsx}",
        "!src/**/*.d.ts",
        "!src/**/*.stories.{js,jsx,ts,tsx}",
        "!src/**/index.{js,jsx,ts,tsx}"
    ]
}

module.exports = createJestConfig(customJestConfig)
