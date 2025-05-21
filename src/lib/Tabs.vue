<template>
  <div class="ciallo-tabs">
    <div class="ciallo-tabs-nav">
      <div
        class="ciallo-tabs-nav-item"
        v-for="(t, index) in titles"
        @click="select(t)"
        :class="{ selected: t === selected }"
        :key="index"
      >
        {{ t }}
      </div>
    </div>
    <div class="ciallo-tabs-content">
      <component 
        class="ciallo-tabs-content-item" 
        :is="current" 
        v-if="current"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Tab from "./Tab.vue";
import { computed } from "vue";

export default {
  props: {
    selected: {
      type: String,
      required: true
    },
  },
  setup(props, context) {
    const defaults = context.slots.default?.() || [];
    
    // 验证子组件
    defaults.forEach((tag) => {
      if (tag.type !== Tab) {
        throw new Error("Tabs 子标签必须是 Tab");
      }
    });

    const titles = defaults.map((tag) => tag.props.title);
    
    // 确保有默认选中的标签
    if (!titles.includes(props.selected)) {
      context.emit("update:selected", titles[0]);
    }

    const current = computed(() => {
      return defaults.find((tag) => tag.props.title === props.selected);
    });

    const select = (title: string) => {
      context.emit("update:selected", title);
    };

    return {
      defaults,
      titles,
      current,
      select,
    };
  },
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
      position: relative;
      transition: color 0.3s;

      &:first-child {
        margin-left: 0;
      }

      &.selected {
        color: $blue;
        
        &::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background: $blue;
        }
      }
    }
  }

  &-content {
    padding: 8px 0;
    transition: all 0.3s;
  }
}
</style>
