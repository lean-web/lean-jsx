/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  displayName: "Core",
  preset: "ts-jest",
  moduleNameMapper: {
    "^@tests/(.*)$": "<rootDir>/tests/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.test.json",
      },
    ],
  },
  testMatch: [
    "<rootDir>/tests/e2e/**/*.test.ts",
    "<rootDir>/tests/e2e/**/*.test.tsx",
  ],
  prettierPath: require.resolve("prettier-2"),
};
