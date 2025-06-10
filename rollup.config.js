
import esbuild from 'rollup-plugin-esbuild'
import vue from 'rollup-plugin-vue'
import scss from 'rollup-plugin-scss'
import * as dartSass from 'sass';
import { terser } from "rollup-plugin-terser"

export default {
  input: 'src/lib/index.ts',
  external: ['vue'],
  output: {
    globals: {
      vue: 'Vue'
    },
    name: 'ciallo',
    file: 'dist/lib/ciallo.js',
    format: 'umd',
    plugins: [terser()]
  },
  plugins: [
    vue({
      include: /\.vue$/,
    }),
    scss({ 
      include: /\.scss$/, 
      sass: dartSass,
      output: false
    }),
    esbuild({
      include: /\.[jt]s$/,
      minify: process.env.NODE_ENV === 'production',
      target: 'es2015' 
    })
  ],
}