// Rollup构建配置 - 用于构建组件库的生产版本
import esbuild from 'rollup-plugin-esbuild'
import vue from 'rollup-plugin-vue'
import scss from 'rollup-plugin-scss'
import * as dartSass from 'sass';
import { terser } from "rollup-plugin-terser"

export default {
  // 入口文件：组件库的主导出文件
  input: 'src/lib/index.ts',
  
  // 外部依赖：不打包进最终文件，由使用者提供
  external: ['vue'],
  
  // 输出配置
  output: {
    // 全局变量映射（用于UMD格式）
    globals: {
      vue: 'Vue'
    },
    // 全局变量名
    name: 'ciallo',
    // 输出文件路径
    file: 'dist/lib/ciallo.js',
    // 输出格式：UMD（通用模块定义）
    format: 'umd',
    // 输出插件：代码压缩
    plugins: [terser()]
  },
  
  // 构建插件配置
  plugins: [
    // Vue单文件组件处理
    vue({
      include: /\.vue$/,
    }),
    
    // SCSS样式处理
    scss({ 
      include: /\.scss$/, 
      sass: dartSass,
      output: false // 不单独输出CSS文件
    }),
    
    // TypeScript和JavaScript编译
    esbuild({
      include: /\.[jt]s$/,
      minify: process.env.NODE_ENV === 'production',
      target: 'es2015' 
    })
  ],
}