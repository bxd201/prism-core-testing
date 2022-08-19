import rollupConfigShared from './rollup.config.shared'
import generatePlugins from './rollup.config.shared.plugins'

export default {
  ...rollupConfigShared,
  input: 'src/index-protected.tsx',
  plugins: generatePlugins('./tailwind.config.protected.js')
}
