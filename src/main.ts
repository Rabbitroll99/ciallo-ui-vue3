// 引入组件库的基础样式
import "./lib/Ciallo.scss";
// 引入项目的全局样式
import "./index.scss";
import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
// 引入SVG图标文件
import "./assets/svg.js";
// 引入GitHub风格的Markdown样式
import "github-markdown-css";

// 创建Vue应用实例
const app = createApp(App);
// 使用路由插件
app.use(router);
// 挂载应用到DOM中id为app的元素
app.mount("#app");
