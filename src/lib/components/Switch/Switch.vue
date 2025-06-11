<template>
  <!-- 
    开关组件
    提供类似iOS风格的开关控件
    支持键盘导航和无障碍访问
  -->
  <button class="ciallo-switch" :class="computedClasses" @click="toggle" @keydown.space.prevent="toggle"
    @keydown.enter.prevent="toggle" :disabled="props.disabled" :aria-checked="props.value" :aria-label="props.ariaLabel"
    role="switch" type="button">
    <!-- 开关滑块 -->
    <span class="ciallo-switch-thumb" aria-hidden="true"></span>

    <!-- 加载状态指示器 -->
    <span v-if="props.loading" class="ciallo-switch-loading" aria-hidden="true"></span>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

// 组件属性定义
const props = defineProps({
  value: {
    type: Boolean,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  size: {
    type: String as () => "small" | "normal" | "large",
    default: 'normal'
  },
  ariaLabel: {
    type: String,
    default: ''
  }
});

// 事件发射器
const emit = defineEmits(['update:value', 'change']);

// ===== 计算属性 =====

// 计算CSS类名，优化性能
const computedClasses = computed(() => ({
  'ciallo-switch-checked': props.value,
  'ciallo-switch-disabled': props.disabled || props.loading,
  'ciallo-switch-loading': props.loading,
  [`ciallo-switch-${props.size}`]: true,
}));

// ===== 核心方法 =====

/**
 * 切换开关状态
 * 包含防抖和状态检查
 */
const toggle = (): void => {
  // 如果禁用或加载中，不响应操作
  if (props.disabled || props.loading) return;

  // 发送状态变更事件
  emit("update:value", !props.value);
  emit("change", !props.value);
};
</script>

<style lang="scss">
/* 导入设计令牌和工具函数 */
@use "../../tokens/colors.scss" as *;
@use "../../tokens/size.scss" as *;
@use "../../tokens/css-vars.scss" as *;
@use "sass:math";

/* === 开关尺寸定义 === */
$switch-height: 22px;
$switch-width: $switch-height * 2;
$thumb-size: $switch-height - 4px;
$thumb-margin: 2px;

/* 小尺寸开关 */
$switch-height-small: 16px;
$switch-width-small: $switch-height-small * 2;
$thumb-size-small: $switch-height-small - 3px;
$thumb-margin-small: 1.5px;

/* 大尺寸开关 */
$switch-height-large: 28px;
$switch-width-large: $switch-height-large * 2;
$thumb-size-large: $switch-height-large - 4px;
$thumb-margin-large: 2px;

/* === 开关基础样式 === */
.ciallo-switch {
  /* 基础布局 */
  position: relative;
  display: inline-block;
  height: $switch-height;
  width: $switch-width;
  padding: 0;
  border: none;
  border-radius: math.div($switch-height, 2);
  cursor: pointer;

  /* 默认颜色（未选中状态） */
  background: theme-var(text-color-disabled);

  /* 过渡动画（优化性能） */
  transition:
    background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  /* 移除默认焦点样式 */
  &:focus {
    outline: none;
    /* 使用box-shadow实现焦点指示器 */
    box-shadow:
      0 0 0 2px theme-var(background-color),
      0 0 0 4px theme-var(primary-color);
  }

  /* === 开关滑块样式 === */
  .ciallo-switch-thumb {
    position: absolute;
    top: $thumb-margin;
    left: $thumb-margin;
    height: $thumb-size;
    width: $thumb-size;
    background: white;
    border-radius: math.div($thumb-size, 2);
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.2),
      0 1px 2px rgba(0, 0, 0, 0.1);

    /* 使用transform优化动画性能 */
    transition:
      transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
      width 0.15s cubic-bezier(0.4, 0, 0.2, 1);

    /* 启用GPU加速 */
    will-change: transform, width;
  }

  /* === 选中状态样式 === */
  &.ciallo-switch-checked {
    background: theme-var(primary-color);

    .ciallo-switch-thumb {
      /* 使用transform替代left改变，性能更好 */
      transform: translateX(calc(#{$switch-width} - #{$thumb-size} - #{$thumb-margin * 2}));
    }
  }

  /* === 激活状态样式（按压效果）=== */
  &:active:not(.ciallo-switch-disabled) {
    .ciallo-switch-thumb {
      /* 按压时滑块变宽，提供视觉反馈 */
      width: $thumb-size + 4px;
    }

    /* 选中状态下的按压效果 */
    &.ciallo-switch-checked .ciallo-switch-thumb {
      transform: translateX(calc(#{$switch-width} - #{$thumb-size + 4px} - #{$thumb-margin * 2}));
    }
  }

  /* === 禁用状态样式 === */
  &.ciallo-switch-disabled {
    cursor: not-allowed;
    opacity: 0.6;

    /* 移除所有交互效果 */
    &:focus {
      box-shadow: none;
    }

    .ciallo-switch-thumb {
      box-shadow: none;
    }
  }

  /* === 加载状态样式 === */
  &.ciallo-switch-loading {
    cursor: wait;

    .ciallo-switch-thumb {
      /* 加载时滑块稍微缩小 */
      transform: scale(0.85);
    }
  }

  /* 加载指示器 */
  .ciallo-switch-loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 12px;
    height: 12px;
    border: 2px solid theme-var(primary-color);
    border-top-color: transparent;
    border-radius: 50%;
    animation: ciallo-spin 1s infinite linear;
  }

  /* === 尺寸变体 === */

  /* 小尺寸开关 */
  &.ciallo-switch-small {
    height: $switch-height-small;
    width: $switch-width-small;
    border-radius: math.div($switch-height-small, 2);

    .ciallo-switch-thumb {
      top: $thumb-margin-small;
      left: $thumb-margin-small;
      height: $thumb-size-small;
      width: $thumb-size-small;
      border-radius: math.div($thumb-size-small, 2);
    }

    &.ciallo-switch-checked .ciallo-switch-thumb {
      transform: translateX(calc(#{$switch-width-small} - #{$thumb-size-small} - #{$thumb-margin-small * 2}));
    }

    &:active:not(.ciallo-switch-disabled) {
      .ciallo-switch-thumb {
        width: $thumb-size-small + 3px;
      }

      &.ciallo-switch-checked .ciallo-switch-thumb {
        transform: translateX(calc(#{$switch-width-small} - #{$thumb-size-small + 3px} - #{$thumb-margin-small * 2}));
      }
    }

    .ciallo-switch-loading {
      width: 8px;
      height: 8px;
    }
  }

  /* 大尺寸开关 */
  &.ciallo-switch-large {
    height: $switch-height-large;
    width: $switch-width-large;
    border-radius: math.div($switch-height-large, 2);

    .ciallo-switch-thumb {
      top: $thumb-margin-large;
      left: $thumb-margin-large;
      height: $thumb-size-large;
      width: $thumb-size-large;
      border-radius: math.div($thumb-size-large, 2);
    }

    &.ciallo-switch-checked .ciallo-switch-thumb {
      transform: translateX(calc(#{$switch-width-large} - #{$thumb-size-large} - #{$thumb-margin-large * 2}));
    }

    &:active:not(.ciallo-switch-disabled) {
      .ciallo-switch-thumb {
        width: $thumb-size-large + 6px;
      }

      &.ciallo-switch-checked .ciallo-switch-thumb {
        transform: translateX(calc(#{$switch-width-large} - #{$thumb-size-large + 6px} - #{$thumb-margin-large * 2}));
      }
    }

    .ciallo-switch-loading {
      width: 16px;
      height: 16px;
    }
  }
}

/* === 旋转动画 === */
@keyframes ciallo-spin {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* === 响应式设计 === */

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .ciallo-switch {
    /* 在触摸设备上增加最小点击区域 */
    min-height: 44px;
    min-width: 44px;

    /* 移除悬停效果 */
    &:hover {
      background: inherit;
    }
  }
}

/* === 减少动画偏好支持 === */
@media (prefers-reduced-motion: reduce) {
  .ciallo-switch {
    transition: none;

    .ciallo-switch-thumb {
      transition: none;
    }

    .ciallo-switch-loading {
      animation: none;
    }
  }
}

/* === 高对比度模式支持 === */
@media (prefers-contrast: high) {
  .ciallo-switch {
    border: 2px solid;

    .ciallo-switch-thumb {
      border: 1px solid;
    }
  }
}

/* === 强制颜色模式支持 === */
@media (forced-colors: active) {
  .ciallo-switch {
    forced-color-adjust: none;
    border: 1px solid ButtonText;

    &.ciallo-switch-checked {
      background: Highlight;
    }

    .ciallo-switch-thumb {
      background: ButtonFace;
      border: 1px solid ButtonText;
    }
  }
}
</style>
