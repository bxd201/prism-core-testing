module.exports = {
  setupFilesAfterEnv: [
    'jest-canvas-mock',
    '<rootDir>/setup/setupFileAfterEnv.js'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/__tests__/unit/components/MatchPhoto',
    '<rootDir>/__tests__/unit/components/SceneManager',
    '<rootDir>/__tests__/advanced'
  ],
  moduleNameMapper: {
    '^dnd-core$': 'dnd-core/dist/cjs',
    '^react-dnd$': 'react-dnd/dist/cjs',
    '^react-dnd-html5-backend$': 'react-dnd-html5-backend/dist/cjs',
    '^react-dnd-touch-backend$': 'react-dnd-touch-backend/dist/cjs',
    '^react-dnd-test-backend$': 'react-dnd-test-backend/dist/cjs',
    '^react-dnd-test-utils$': 'react-dnd-test-utils/dist/cjs',
    '^variables$': '<rootDir>/src/shared/variablesExport.js',
    '\\.((s?css)|less)$': 'identity-obj-proxy',
    '^constants/(.*)$': '<rootDir>/src/constants/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
    '^config/(.*)$': '<rootDir>/config/$1',
    '^__mocks__/(.*)$': '<rootDir>/__mocks__/$1'
  },
  globals: {
    'API_PATH': 'http://localhost',
    'APP_NAME': 'PRISM',
    'APP_VERSION': '1.3.3',
    'BASE_PATH': 'localhost',
    'ENV': 'development',
    'ML_API_URL': 'localhost',
    'WEBPACK_CONSTANTS': {},
    'VAR_NAMES': {},
    'VAR_VALUES': {}
  }
}
