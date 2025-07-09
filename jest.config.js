module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/main'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: ['src/main/**/*.ts', '!src/main/**/*.d.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.node.json'
      }
    ]
  },
  testPathIgnorePatterns: ['/node_modules/', '/out/'],
  coveragePathIgnorePatterns: ['/node_modules/', '/out/'],
  setupFilesAfterEnv: []
}
