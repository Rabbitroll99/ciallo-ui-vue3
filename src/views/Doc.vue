<template>
  <div class="layout">
    <Topnav class="nav" :toggleMenuButtonVisible="showMenuButton" />
    <div class="content" :class="{ 'aside-visible': asideVisible }">
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
        </ol>
      </aside>
      <div class="mask" :class="{ 'mask-visible': asideVisible && isMobile }" @click="hideAside"></div>
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
    const asideVisible = inject<Ref<boolean>>("asideVisible", ref(false));
    const isMobile = ref(window.innerWidth <= 500);

    const showMenuButton = computed(() => {
      return isMobile.value;
    });

    const hideAside = () => {
      if (window.innerWidth <= 500 && asideVisible) {
        asideVisible.value = false;
      }
    };

    const handleResize = () => {
      isMobile.value = window.innerWidth <= 500;
    };

    onMounted(() => {
      window.addEventListener("resize", handleResize);
    });

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
$aside-index: 10;
$transition-duration: 0.3s;

.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;

  >.nav {
    flex-shrink: 0;
  }

  >.content {
    flex-grow: 1;
    padding-top: 60px;
    padding-left: 156px;

    @media (max-width: 500px) {
      padding-left: 0;
    }
  }
}

.content {
  display: flex;

  >aside {
    flex-shrink: 0;
    transform: translateX(-100%);
    transition: transform $transition-duration ease-in-out, background-color $transition-duration ease-in-out;
    visibility: hidden;

    &.aside-visible {
      transform: translateX(0);
      visibility: visible;
    }
  }

  >main {
    flex-grow: 1;
    padding: 16px;
    background: white;
  }

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

    &.mask-visible {
      opacity: 1;
      visibility: visible;
    }
  }
}

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

  >h2 {
    margin-bottom: 4px;
    padding: 0 16px;
  }

  >ol {
    >li {
      >a {
        display: block;
        padding: 4px 16px;
        text-decoration: none;
        transition: background-color 0.3s ease-in-out;
      }

      .router-link-active {
        background: rgba(255, 255, 255, 0.8);
      }
    }
  }
}

main {
  overflow: auto;
}
</style>
