const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
require('dotenv').config()

module.exports = {
  analyzeBundle:
    process.env.ANALYZE_BUNDLES &&
    new BundleAnalyzerPlugin({
      analyzerPort: 'auto'
    })
}
