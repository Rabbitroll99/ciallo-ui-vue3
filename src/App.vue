<template>
  <div>
    导航栏 | <router-link to="/">rabbit</router-link> |
    <router-link to="/xxx">rabbit2</router-link>
  </div>
  <hr />
  <router-view />
</template>

<script>
import { RouterLink } from "vue-router";

export default {
  name: "App",
};
</script>
