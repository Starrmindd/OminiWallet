module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@omniwallet/utils$': '<rootDir>/../../packages/utils/src/index.ts',
    '^@omniwallet/blockchain$': '<rootDir>/../../packages/blockchain/src/index.ts',
  },
};
