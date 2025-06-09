<template>
  <div class="layout">
    <Topnav class="nav" :toggleMenuButtonVisible="showMenuButton" />
    <div class="content" :class="{ 'aside-visible': asideVisible }">
      <aside v-if="asideVisible">
        <h2>文档</h2>
        <ol>
          <li><router-link to="/doc/intro">介绍</router-link></li>
          <li><router-link to="/doc/install">安装</router-link></li>
          <li><router-link to="/doc/get-started">开始使用</router-link></li>
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
    };
  },
};
</script>

<style lang="scss" scoped>
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
  }

  >main {
    flex-grow: 1;
    padding: 16px;
    background: white;
  }
}

aside {
  background: lightblue;
  width: 150px;
  padding: 16px 0;
  position: fixed;
  top: 0;
  left: 0;
  padding-top: 70px;
  height: 100%;

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
      }

      .router-link-active {
        background: white;
      }
    }
  }
}

main {
  overflow: auto;
}
</style>
