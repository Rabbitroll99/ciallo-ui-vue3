<template>
  <div class="layout">
    <!-- 顶部导航栏 -->
    <Topnav class="nav" :toggleMenuButtonVisible="showMenuButton" />
    <div class="content" :class="{ 'aside-visible': asideVisible }">
      <!-- 侧边栏导航 -->
      <aside :class="{ 'aside-visible': asideVisible }">
        <h2>文档</h2>
        <ol>
          <li><router-link to="/doc/intro" @click="hideAside">介绍</router-link></li>
          <li><router-link to="/doc/install" @click="hideAside">安装</router-link></li>
          <li><router-link to="/doc/get-started" @click="hideAside">开始使用</router-link></li>
        </ol>
        <h2>组件列表</h2>
        <ol>
          <li>
            <router-link to="/doc/switch" @click="hideAside">Switch组件</router-link>
          </li>
          <li>
            <router-link to="/doc/button" @click="hideAside">Button组件</router-link>
          </li>
          <li>
            <router-link to="/doc/dialog" @click="hideAside">Dialog组件</router-link>
          </li>
          <li>
            <router-link to="/doc/tabs" @click="hideAside">Tabs组件</router-link>
          </li>
          <li>
            <router-link to="/doc/carousel" @click="hideAside">Carousel组件</router-link>
          </li>
        </ol>
      </aside>
      <!-- 移动端遮罩层：点击可关闭侧边栏 -->
      <div class="mask" :class="{ 'mask-visible': asideVisible && isMobile }" @click="hideAside"></div>
      <!-- 主要内容区域 -->
      <main>
        <router-view />
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { inject, Ref, computed, ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import Topnav from "../components/Topnav.vue";

export default {
  components: { Topnav },
  setup() {
    const route = useRoute();
    // 注入全局的侧边栏可见状态
    const asideVisible = inject<Ref<boolean>>("asideVisible", ref(false));
    // 判断是否为移动端
    const isMobile = ref(window.innerWidth <= 500);

    // 计算是否显示菜单按钮（仅移动端显示）
    const showMenuButton = computed(() => {
      return isMobile.value;
    });

    // 隐藏侧边栏（移动端点击菜单项时调用）
    const hideAside = () => {
      if (window.innerWidth <= 500 && asideVisible) {
        asideVisible.value = false;
      }
    };

    // 处理窗口大小变化
    const handleResize = () => {
      isMobile.value = window.innerWidth <= 500;
    };

    // 监听窗口大小变化
    onMounted(() => {
      window.addEventListener("resize", handleResize);
    });

    // 清理事件监听器
    onUnmounted(() => {
      window.removeEventListener("resize", handleResize);
    });

    return {
      asideVisible,
      showMenuButton,
      hideAside,
      isMobile,
    };
  },
};
</script>

<style lang="scss" scoped>
// 样式变量定义
$aside-index: 10;
$transition-duration: 0.3s;

/* 整体布局容器 */
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;

  /* 顶部导航栏 */
  >.nav {
    flex-shrink: 0;
  }

  /* 主要内容区域 */
  >.content {
    flex-grow: 1;
    padding-top: 60px;
    padding-left: 156px;

    /* 移动端取消左边距 */
    @media (max-width: 500px) {
      padding-left: 0;
    }
  }
}

/* 内容区域布局 */
.content {
  display: flex;

  /* 侧边栏样式 */
  >aside {
    flex-shrink: 0;
    transform: translateX(-100%);
    transition: transform $transition-duration ease-in-out, background-color $transition-duration ease-in-out;
    visibility: hidden;

    /* 侧边栏显示状态 */
    &.aside-visible {
      transform: translateX(0);
      visibility: visible;
    }
  }

  /* 主内容区域 */
  >main {
    flex-grow: 1;
    padding: 16px;
    background: white;
  }

  /* 移动端遮罩层 */
  >.mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    z-index: $aside-index - 1;
    opacity: 0;
    transition: opacity $transition-duration ease-in-out;
    visibility: hidden;

    /* 遮罩层显示状态 */
    &.mask-visible {
      opacity: 1;
      visibility: visible;
    }
  }
}

/* 侧边栏详细样式 */
aside {
  background: rgba(173, 216, 230, 0.95);
  width: 150px;
  padding: 16px 0;
  position: fixed;
  top: 0;
  left: 0;
  padding-top: 70px;
  height: 100%;
  z-index: $aside-index;
  backdrop-filter: blur(5px);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  transition: transform $transition-duration ease-in-out, background-color $transition-duration ease-in-out;

  /* 侧边栏标题样式 */
  >h2 {
    margin-bottom: 4px;
    padding: 0 16px;
  }

  /* 导航列表样式 */
  >ol {
    >li {
      >a {
        display: block;
        padding: 4px 16px;
        text-decoration: none;
        transition: background-color 0.3s ease-in-out;
      }

      /* 当前活跃链接样式 */
      .router-link-active {
        background: rgba(255, 255, 255, 0.8);
      }
    }
  }
}

/* 主内容区域滚动 */
main {
  overflow: auto;
}
</style>
