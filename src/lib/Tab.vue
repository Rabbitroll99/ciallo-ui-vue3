<template>
  <div class="ciallo-tab">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true
  }
});
</script>

<style lang="scss">
.ciallo-tab {
  padding: 8px 0;
}
</style>
