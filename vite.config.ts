import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import VueMarkdown from "unplugin-vue-markdown/vite";
import fs from "fs";
import { parse } from "@vue/compiler-sfc";

export default defineConfig({
  base: "./",
  assetsDir: "assets",
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/],
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === "demo",
        },
      },
    }),
    VueMarkdown({
      // 这里可以根据需要添加配置项，比如 wrapperComponent, markdownItOptions 等
    }),
    {
      name: "demo-transform",
      transform(code, id) {
        if (id.includes("?vue&type=demo")) {
          const filePath = id.split("?")[0];
          const file = fs.readFileSync(filePath).toString();
          const parsed = parse(file);
          const demoBlock = parsed.descriptor.customBlocks.find(
            (n) => n.type === "demo"
          );

          if (!demoBlock || !demoBlock.content) return null;

          const title = demoBlock.content.trim();
          const main = file.trim();

          return `export default function (Component) {
            Component.__sourceCode = ${JSON.stringify(main)}
            Component.__sourceCodeTitle = ${JSON.stringify(title)}
          }`.trim();
        }
        return null;
      },
    },
  ],
});
