import commonjs from '@rollup/plugin-commonjs'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import pkg from './package.json'
import postcss from 'rollup-plugin-postcss'
import resolve from '@rollup/plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'
import replace from '@rollup/plugin-replace'

export default {
  input: 'src/index.tsx',
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
  external: [/@babel\/runtime/, /lodash*/, ...Object.keys(pkg.peerDependencies), ...Object.keys(pkg.dependencies)],
  plugins: [
    replace({
      'TOOLKIT_PROTECT_CLASS': JSON.stringify(process.env.TOOLKIT_PROTECT_CLASS || '')
    }),
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript(),
    postcss({
      config: true,
      extract: true,
      minimize: false,
      extensions: ['.css']
    })
  ]
}
