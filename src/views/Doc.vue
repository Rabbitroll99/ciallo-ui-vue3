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

  /* 侧边栏标题样式 - 卡片风格 */
  >h2 {
    margin: 0 12px 12px 12px;
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 600;
    color: #005c57;
    background: linear-gradient(135deg, #ffffff 0%, #f8fdfd 100%);
    border-radius: 8px;
    box-shadow:
      0 2px 8px rgba(0, 121, 116, 0.15),
      0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.8);
    position: relative;
    text-align: center;
    letter-spacing: 0.5px;
    transition: all $transition-duration ease-in-out;

    &:not(:first-child) {
      margin-top: 20px;
    }

    /* 卡片的微妙装饰线 */
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 30px;
      height: 3px;
      background: linear-gradient(90deg, #02bcb0, #007974);
      border-radius: 0 0 3px 3px;
      transition: all $transition-duration ease-in-out;
    }
  }

  /* 侧边栏隐藏时重置所有变换 */
  &:not(.aside-visible) {

    >h2,
    >ol>li>a,
    >ol>li .router-link-active {
      transform: none !important;
      box-shadow: none !important;
    }

    >ol>li .router-link-active::before,
    >ol>li .router-link-active::after {
      opacity: 0 !important;
      transform: none !important;
      box-shadow: none !important;
    }
  }

  /* 侧边栏可见时才启用标题悬停效果 */
  &.aside-visible {
    >h2:hover {
      transform: translateY(-1px);
      box-shadow:
        0 4px 12px rgba(0, 121, 116, 0.2),
        0 2px 6px rgba(0, 0, 0, 0.15);
    }
  }

  /* 导航列表样式 - 卡片风格 */
  >ol {
    padding: 0 12px;

    >li {
      margin-bottom: 6px;

      >a {
        display: block;
        padding: 10px 16px;
        margin: 0;
        text-decoration: none;
        color: #4a5568;
        font-size: 13px;
        font-weight: 500;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.4);
        box-shadow: 0 1px 3px rgba(0, 121, 116, 0.08);
        transition: all $transition-duration ease-in-out;
        position: relative;

        /* 左侧装饰点 */
        &::before {
          content: '';
          position: absolute;
          left: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 4px;
          background: #02bcb0;
          border-radius: 50%;
          opacity: 0.6;
          transition: all $transition-duration ease-in-out;
        }

        /* 右侧指示器基础样式 */
        &::after {
          transition: all $transition-duration ease-in-out;
        }
      }

      /* 当前活跃链接样式 */
      .router-link-active {
        color: #005c57;
        background: linear-gradient(135deg,
            rgba(255, 255, 255, 0.95) 0%,
            rgba(248, 253, 253, 0.9) 100%);
        box-shadow:
          0 3px 8px rgba(0, 121, 116, 0.2),
          0 1px 3px rgba(0, 0, 0, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(2, 188, 176, 0.3);
        font-weight: 600;
        transform: translateX(3px);

        &::before {
          opacity: 1;
          background: #007974;
          transform: translateY(-50%) scale(1.4);
          box-shadow: 0 0 6px rgba(0, 121, 116, 0.5);
        }

        /* 右侧活跃指示器 */
        &::after {
          content: '';
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-left: 4px solid #007974;
          border-top: 3px solid transparent;
          border-bottom: 3px solid transparent;
          transition: all $transition-duration ease-in-out;
        }

      }
    }
  }

  /* 侧边栏可见时才启用链接悬停效果 */
  &.aside-visible {
    >ol {
      >li {
        >a:hover {
          color: #005c57;
          background: rgba(255, 255, 255, 0.85);
          transform: translateX(2px);
          box-shadow:
            0 2px 6px rgba(0, 121, 116, 0.15),
            0 1px 3px rgba(0, 0, 0, 0.1);
          border-color: rgba(255, 255, 255, 0.7);

          &::before {
            opacity: 1;
            transform: translateY(-50%) scale(1.2);
            box-shadow: 0 0 4px rgba(2, 188, 176, 0.4);
          }
        }

        .router-link-active:hover {
          transform: translateX(3px);
          box-shadow:
            0 4px 10px rgba(0, 121, 116, 0.25),
            0 2px 6px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }
      }
    }
  }
}

/* 主内容区域滚动 */
main {
  overflow: auto;
}
</style>
