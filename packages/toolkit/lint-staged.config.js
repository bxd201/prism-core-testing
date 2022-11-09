module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint', 'prettier --check'],
  // '**/*.ts?(x)': () => 'yarn check-types', Moved to pre-push hook
  '*.json': ['prettier --write']
}
