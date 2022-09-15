module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint', 'prettier --check'],
  '**/*.ts?(x)': () => 'yarn check-types',
  '*.json': ['prettier --write']
}
