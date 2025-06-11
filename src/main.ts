// 引入组件库的基础样式
import "./lib/Ciallo.scss";
// 引入项目的全局样式
import "./styles/index.scss";
import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router/index";
// 引入SVG图标文件
import "./assets/svg.js";
// 引入GitHub风格的Markdown样式
import "github-markdown-css";
// 引入代码高亮样式
import "prismjs/themes/prism.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-markup-templating"; // vue组件需要
import "prismjs/components/prism-markup"; // HTML支持
import "prismjs/components/prism-css";
import "prismjs/components/prism-scss";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
// 引入自定义代码高亮样式
import "./styles/prism-custom.scss";

// 创建Vue应用实例
const app = createApp(App);
// 使用路由插件
app.use(router);
// 挂载应用到DOM中id为app的元素
app.mount("#app");
