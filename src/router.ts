import { createWebHashHistory, createRouter } from "vue-router";
// 导入页面组件
import Home from "./views/Home.vue";
import Doc from "./views/Doc.vue";
// 导入各个组件的示例页面
import SwitchDemo from "./components/SwitchDemo.vue";
import ButtonDemo from "./components/ButtonDemo.vue";
import DialogDemo from "./components/DialogDemo.vue";
import TabsDemo from "./components/TabsDemo.vue";
import CarouselDemo from "./components/CarouselDemo.vue";
// 导入文档页面
import Intro from "./views/Intro.vue";
import GetStarted from "./views/GetStarted.vue";
import Install from "./views/Install.vue";

// 创建hash模式的路由历史记录
const history = createWebHashHistory();

// 导出路由实例
export const router = createRouter({
  history: history,
  routes: [
    // 首页路由
    { path: "/", component: Home },
    // 文档页面路由，包含嵌套子路由
    {
      path: "/doc",
      component: Doc,
      children: [
        // 默认重定向到介绍页面
        { path: "", redirect: "/doc/intro" },
        // 文档相关页面
        { path: "intro", component: Intro },
        { path: "get-started", component: GetStarted },
        { path: "install", component: Install },
        // 组件示例页面
        { path: "switch", component: SwitchDemo },
        { path: "button", component: ButtonDemo },
        { path: "dialog", component: DialogDemo },
        { path: "tabs", component: TabsDemo },
        { path: "carousel", component: CarouselDemo },
      ],
    },
  ],
});

// 路由切换后的钩子函数（当前为空实现）
router.afterEach(() => {});
