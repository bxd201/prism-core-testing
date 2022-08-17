import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import postcss from 'rollup-plugin-postcss'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import simplevars from 'postcss-simple-vars'
import nested from 'postcss-nested'

import pkg from './package.json'

export default {
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    },
    {
      file: pkg.module,
      format: 'esm',
      exports: 'named',
      sourcemap: true
    }
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript(),
    postcss({
      extract: true,
      minimize: false,
      plugins: [simplevars(), nested()],
      extensions: ['.css']
    })
  ],
  external: [/@babel\/runtime/, /lodash*/, ...Object.keys(pkg.peerDependencies), ...Object.keys(pkg.dependencies)]
}
