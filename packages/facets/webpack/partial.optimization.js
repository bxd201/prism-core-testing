const flags = require('./constants')

module.exports = {
  checkWasmTypes: flags.production,
  concatenateModules: flags.production,
  flagIncludedChunks: false, // keep this false to prevent errors embedding multiple facets on the same page
  mangleWasmImports: false,
  mergeDuplicateChunks: true,
  minimize: flags.production,
  moduleIds: flags.production ? 'deterministic' : 'named',
  nodeEnv: flags.mode,
  portableRecords: false,
  providedExports: true,
  removeAvailableModules: true,
  removeEmptyChunks: true,
  sideEffects: flags.production,
  usedExports: flags.production
}
