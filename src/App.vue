<template>
  <router-view />
</template>

<script lang="ts">
import { provide, ref } from "vue";
import { router } from "./router";

export default {
  name: "App",
  setup() {
    const width = document.documentElement.clientWidth;
    const asideVisible = ref(width <= 500 ? true : true);
    provide("asideVisible", asideVisible);

    router.afterEach((to) => {
      if (width <= 500 && to.path.startsWith("/doc/")) {
        asideVisible.value = false;
      }
    });

    window.addEventListener("resize", () => {
      const newWidth = document.documentElement.clientWidth;
      if (newWidth <= 500) {
        if (window.location.hash.includes("/doc/")) {
          asideVisible.value = false;
        }
      }
    });
  },
};
</script>
