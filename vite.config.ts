import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueMarkdown from 'unplugin-vue-markdown/vite'
import fs from 'fs'
import { parse } from '@vue/compiler-sfc'

export default defineConfig({
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/],
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'demo'
        }
      }
    }),
    VueMarkdown({
      // 这里可以根据需要添加配置项，比如 wrapperComponent, markdownItOptions 等
    }),
    {
      name: 'demo-transform',
      transform(code, id) {
        if (id.includes('?vue&type=demo')) {
          const file = fs.readFileSync(id.split('?')[0]).toString()
          const parsed = parse(file).descriptor.customBlocks.find(n => n.type === 'demo')
          if (!parsed) return null
          
          const title = parsed.content
          const main = file.split(parsed.loc.source).join('').trim()
          return `export default function (Component) {
            Component.__sourceCode = ${JSON.stringify(main)}
            Component.__sourceCodeTitle = ${JSON.stringify(title)}
          }`.trim()
        }
        return null
      }
    }
  ]
})
