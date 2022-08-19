import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import postcss from 'rollup-plugin-postcss'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import simplevars from 'postcss-simple-vars'
import nested from 'postcss-nested'

function generatePlugins (tailwindConfig) {
  return [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript(),
    postcss({
      config: {
        ctx: {
          tailwindConfig: tailwindConfig
        }
      },
      extract: true,
      minimize: false,
      plugins: [simplevars(), nested()],
      extensions: ['.css']
    })
  ]
}

export default generatePlugins