/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  displayName: "Core",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@tests/(.*)$": "<rootDir>/tests/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }],
  },
  testMatch: [
    "<rootDir>/tests/e2e/**/*.test.ts",
    "<rootDir>/tests/e2e/**/*.test.tsx",
  ],
};
