<template>
  <!-- 路由视图容器 -->
  <router-view />
</template>

<script setup lang="ts">
import { provide, ref, onMounted } from "vue";
import { router } from "./router";

// 获取初始屏幕宽度
const width = document.documentElement.clientWidth;
// 控制侧边栏显示状态：移动端默认隐藏，桌面端默认显示
const asideVisible = ref(width <= 500 ? false : true);
// 将侧边栏状态提供给子组件使用
provide("asideVisible", asideVisible);

// 路由切换后的处理：移动端访问文档页面时隐藏侧边栏
router.afterEach((to) => {
  if (width <= 500 && to.path.startsWith("/doc/")) {
    asideVisible.value = false;
  }
});

// 组件挂载后监听窗口大小变化
onMounted(() => {
  window.addEventListener("resize", () => {
    const newWidth = document.documentElement.clientWidth;
    // 窗口变小时：如果在文档页面，隐藏侧边栏
    if (newWidth <= 500) {
      if (window.location.hash.includes("/doc/")) {
        asideVisible.value = false;
      }
    } else {
      // 窗口变大时：如果在文档页面，显示侧边栏
      if (window.location.hash.includes("/doc/")) {
        asideVisible.value = true;
      }
    }
  });
});
</script>
