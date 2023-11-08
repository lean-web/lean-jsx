// @ts-check

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  displayName: "lean-jsx",
  preset: "ts-jest",
  moduleNameMapper: {
    "^@tests/(.*)$": "<rootDir>/tests/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }],
  },
  collectCoverageFrom: ["<rootDir>/src/"],
  testMatch: [
    "<rootDir>/tests/unit/**/*.test.ts",
    "<rootDir>/tests/integration/**/*.test.ts",
    "<rootDir>/tests/unit/**/*.test.tsx",
    "<rootDir>/tests/integration/**/*.test.tsx",
  ],
  prettierPath: require.resolve("prettier-2"),
};
