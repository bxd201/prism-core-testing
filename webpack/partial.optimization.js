const flags = require('./constants')

module.exports = {
  minimize: flags.production,
  concatenateModules: flags.production,
  flagIncludedChunks: flags.production,
  checkWasmTypes: flags.production,
  mangleWasmImports: false,
  mergeDuplicateChunks: true,
  moduleIds: flags.production ? 'hashed' : 'named',
  namedChunks: !flags.production,
  namedModules: !flags.production,
  nodeEnv: flags.mode,
  noEmitOnErrors: flags.production,
  occurrenceOrder: false, // <-- KEEP THIS OFF. it can cause a race condition that fails app initialization.
  portableRecords: false,
  providedExports: true,
  removeAvailableModules: true,
  removeEmptyChunks: true,
  sideEffects: flags.production,
  usedExports: flags.production
}
