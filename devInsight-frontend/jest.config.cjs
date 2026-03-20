module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testPathIgnorePatterns: ['<rootDir>/tests/playwright/'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      diagnostics: false,
    }]
  },
  moduleNameMapper: {
    '.*/services/api$': '<rootDir>/src/services/__mocks__/api.ts',
    '\\.css$': '<rootDir>/src/services/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/services/__mocks__/fileMock.js',
  },
  moduleFileExtensions: ['ts','tsx','js','jsx','json'],
}
