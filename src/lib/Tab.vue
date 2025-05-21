<template>
  <div class="ciallo-tab"><slot /></div>
</template>

<script lang="ts">
export default {
  props: {
    title: {
      type: String,
      required: true
    }
  }
};
</script>

<style lang="scss">
.ciallo-tab {
  padding: 8px 0;
}
</style>
