<template>
  <div class="ciallo-tabs">
    <div class="ciallo-tabs-nav" ref="container">
      <div class="ciallo-tabs-nav-item" v-for="(t, index) in titles" :ref="(el) => {
        if (t === selected) selectedItem = el;
      }
        " @click="select(t)" :class="{ selected: t === selected }" :key="index">
        {{ t }}
      </div>
      <div class="ciallo-tabs-nav-indicator" ref="indicator"></div>
    </div>
    <div class="ciallo-tabs-content">
      <component :is="current" :key="current.props.title" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Tab from "./Tab.vue";
import { computed, ref, watchEffect, onMounted, useSlots } from "vue";

const props = defineProps({
  selected: {
    type: String,
  },
});

const emit = defineEmits(['update:selected']);
const selectedItem = ref<HTMLDivElement>(null);
const indicator = ref<HTMLDivElement>(null);
const container = ref<HTMLDivElement>(null);
const slots = useSlots();

onMounted(() => {
  watchEffect(() => {
    if (!selectedItem.value || !indicator.value || !container.value) return;
    const { width } = selectedItem.value.getBoundingClientRect();
    indicator.value.style.width = width + "px";
    const { left: left1 } = container.value.getBoundingClientRect();
    const { left: left2 } = selectedItem.value.getBoundingClientRect();
    const left = left2 - left1;
    indicator.value.style.left = left + "px";
  });
});

const defaults = slots.default?.() || [];
defaults.forEach((tag) => {
  // @ts-ignore
  if (tag.type.name !== Tab.name) {
    throw new Error("Tabs 子标签必须是 Tab");
  }
});

const current = computed(() => {
  return defaults.find((tag) => tag.props.title === props.selected);
});

const titles = defaults.map((tag) => {
  return tag.props.title;
});

const select = (title: string) => {
  emit("update:selected", title);
};
</script>

<style lang="scss">
$blue: #40a9ff;
$color: #333;
$border-color: #d9d9d9;

.ciallo-tabs {
  &-nav {
    display: flex;
    color: $color;
    border-bottom: 1px solid $border-color;
    position: relative;

    &-item {
      padding: 8px 0;
      margin: 0 16px;
      cursor: pointer;

      &:first-child {
        margin-left: 0;
      }

      &.selected {
        color: $blue;
      }
    }

    &-indicator {
      position: absolute;
      height: 3px;
      background: $blue;
      left: 0;
      bottom: -1px;
      width: 100px;
      transition: all 250ms;
    }
  }

  &-content {
    padding: 8px 0;
  }
}
</style>
