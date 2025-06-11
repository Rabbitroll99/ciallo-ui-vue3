import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import VueMarkdown from "unplugin-vue-markdown/vite";
import * as fs from "fs";
import { parse } from "@vue/compiler-sfc";

export default defineConfig({
  // 基础公共路径，设置为相对路径以便于部署
  base: "./",

  // 构建配置
  build: {
    // 静态资源目录
    assetsDir: "assets",
  },

  // 插件配置
  plugins: [
    // Vue插件配置
    vue({
      // 包含.vue和.md文件
      include: [/\.vue$/, /\.md$/],
      template: {
        compilerOptions: {
          // 将demo标签识别为自定义元素
          isCustomElement: (tag) => tag === "demo",
        },
      },
    }),

    // Vue Markdown插件，支持在Vue中使用Markdown
    VueMarkdown({
      markdownItOptions: {
        html: true,
        linkify: true,
        typographer: true,
      },
    }),

    // 自定义插件：处理demo代码块的转换
    {
      name: "demo-transform",
      transform(code, id) {
        // 处理包含demo类型的Vue文件
        if (id.includes("?vue&type=demo")) {
          const filePath = id.split("?")[0];
          const file = fs.readFileSync(filePath).toString();
          const parsed = parse(file);

          // 查找demo自定义块
          const demoBlock = parsed.descriptor.customBlocks.find(
            (n) => n.type === "demo"
          );

          if (!demoBlock || !demoBlock.content) return null;

          const title = demoBlock.content.trim();
          const main = file.trim();

          // 返回转换后的代码，将源码注入到组件中
          return `export default function (Component) {
            Component.__sourceCode = ${JSON.stringify(main)}
            Component.__sourceCodeTitle = ${JSON.stringify(title)}
          }`.trim();
        }
        return null;
      },
    },
  ],

  // CSS预处理器配置
  css: {
    preprocessorOptions: {
      scss: {
        // 使用现代编译器API
        api: "modern-compiler",
        // 忽略过时的JS API警告
        silenceDeprecations: ["legacy-js-api"],
      },
    },
  },
});
