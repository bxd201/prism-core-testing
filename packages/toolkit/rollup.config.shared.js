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
  external: [/@babel\/runtime/, /lodash*/, ...Object.keys(pkg.peerDependencies), ...Object.keys(pkg.dependencies)]
}
