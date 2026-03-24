{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "roots": [
    "<rootDir>/tests",
    "<rootDir>/src"
  ],
  "testMatch": [
    "**/__tests__/**/*.ts",
    "**/?(*.)+(spec|test).ts"
  ],
  "transform": {
    "^.+\\.ts$": "ts-jest"
  },
  "collectCoverageFrom": [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.interface.ts",
    "!src/**/*.types.ts"
  ],
  "coverageDirectory": "coverage",
  "coverageReporters": [
    "text",
    "lcov",
    "html"
  ],
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1"
  },
  "setupFilesAfterEnv": [
    "<rootDir>/tests/setup.ts"
  ],
  "globals": {
    "ts-jest": {
      "tsconfig": {
        "esModuleInterop": true,
        "allowSyntheticDefaultImports": true
      }
    }
  }
}
