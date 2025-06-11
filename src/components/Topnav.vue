<template>
  <div class="topnav">
    <!-- Logo区域 -->
    <router-link to="/" class="logo">
      <svg class="icon">
        <use xlink:href="#icon-bixin"></use>
      </svg>
    </router-link>
    <!-- 导航菜单 -->
    <ul class="menu">
      <li>
        <router-link to="/doc">文档</router-link>
      </li>
    </ul>
    <!-- 移动端菜单切换按钮 -->
    <svg v-if="toggleMenuButtonVisible" class="toggleAside" @click="toggleMenu">
      <use xlink:href="#icon-caidan"></use>
    </svg>
  </div>
</template>

<script lang="ts">
import { inject, Ref, ref } from "vue";

export default {
  props: {
    // 控制是否显示菜单切换按钮（移动端使用）
    toggleMenuButtonVisible: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    // 注入全局的侧边栏可见状态
    const asideVisible = inject<Ref<boolean>>("asideVisible", ref(false));

    // 切换侧边栏显示状态
    const toggleMenu = () => {
      if (asideVisible) {
        asideVisible.value = !asideVisible.value;
      }
    };

    return {
      toggleMenu,
    };
  },
};
</script>

<style lang="scss" scoped>
// 主题色变量
$color: #007974;

/* 顶部导航栏样式 */
.topnav {
  color: $color;
  display: flex;
  padding: 16px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 20;
  justify-content: center;
  align-items: center;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  /* Logo样式 */
  >.logo {
    max-width: 6em;
    margin-right: auto;

    >svg {
      width: 32px;
      height: 32px;
    }
  }

  /* 导航菜单样式 */
  >.menu {
    display: flex;
    white-space: nowrap;
    flex-wrap: nowrap;

    >li {
      margin: 0 1em;
    }
  }

  /* 移动端菜单切换按钮样式 */
  >.toggleAside {
    width: 32px;
    height: 32px;
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    display: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.3s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    &:active {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }

  /* 移动端适配：500px以下 */
  @media (max-width: 500px) {
    padding: 12px 16px;

    /* 隐藏导航菜单 */
    >.menu {
      display: none;
    }

    /* Logo居中显示 */
    >.logo {
      margin: 0 auto;
    }

    /* 显示菜单切换按钮 */
    >.toggleAside {
      display: inline-block;
    }
  }
}
</style>
