/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  setupFiles: ['<rootDir>/jest.setup.ts'],
  // El test de integracion habla con MySQL de verdad (schema:create, INSERT, DELETE)
  testTimeout: 20000,
};
