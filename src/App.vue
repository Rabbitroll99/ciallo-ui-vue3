<template>
  <router-view />
</template>

<script setup lang="ts">
import { provide, ref, onMounted } from "vue";
import { router } from "./router";

const width = document.documentElement.clientWidth;
const asideVisible = ref(width <= 500 ? false : true);
provide("asideVisible", asideVisible);

router.afterEach((to) => {
  if (width <= 500 && to.path.startsWith("/doc/")) {
    asideVisible.value = false;
  }
});

onMounted(() => {
  window.addEventListener("resize", () => {
    const newWidth = document.documentElement.clientWidth;
    if (newWidth <= 500) {
      if (window.location.hash.includes("/doc/")) {
        asideVisible.value = false;
      }
    } else {
      if (window.location.hash.includes("/doc/")) {
        asideVisible.value = true;
      }
    }
  });
});
</script>
