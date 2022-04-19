const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  analyzeBundle: process.env.ANALYZE_BUNDLES && new BundleAnalyzerPlugin({
    analyzerPort: 'auto'
  })
}
