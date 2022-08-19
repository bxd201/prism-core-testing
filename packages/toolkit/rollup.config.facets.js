import rollupConfigShared from './rollup.config.shared'
import generatePlugins from './rollup.config.shared.plugins'

export default {
  ...rollupConfigShared,
  input: 'src/index-facets.tsx',
  plugins: generatePlugins('./tailwind.config.facets.js')
}
