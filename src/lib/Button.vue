<template>
  <!-- 
    通用按钮组件
    支持多种主题、尺寸、级别和加载状态
    遵循无障碍访问标准
  -->
  <button class="ciallo-button" :class="classes" :disabled="props.disabled || props.loading" :aria-busy="props.loading"
    :aria-label="props.loading ? '加载中...' : undefined">
    <!-- 加载状态指示器 -->
    <span v-if="props.loading" class="ciallo-loading-indicator" aria-hidden="true"></span>
    <!-- 按钮内容插槽 -->
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ButtonProps } from "./types/button";

// 组件属性定义，提供合理的默认值
const props = withDefaults(defineProps<ButtonProps>(), {
  theme: 'button',    // 按钮主题：button | link | text
  size: 'normal',     // 按钮尺寸：small | normal | big
  level: 'normal',    // 按钮级别：normal | main | danger
  disabled: false,    // 是否禁用
  loading: false,     // 是否显示加载状态
});

// 计算CSS类名，优化性能避免重复计算
const classes = computed(() => ({
  [`ciallo-theme-${props.theme}`]: true,
  [`ciallo-size-${props.size}`]: true,
  [`ciallo-level-${props.level}`]: true,
  'ciallo-button-loading': props.loading, // 加载状态标识
}));
</script>

<style lang="scss">
// 导入设计令牌和混合函数
@use "./tokens/colors.scss" as *;
@use "./tokens/size.scss" as *;
@use "./tokens/css-vars.scss" as *;
@use "./mixins/button.scss" as *;

// 按钮基础样式
.ciallo-button {
  // 应用基础按钮样式混合
  @include button-base;
  @include button-disabled;

  // 先设置尺寸和基础样式，再设置颜色变体（避免mixed-decls警告）
  @include button-size($height-base, $spacing-md, $font-size-base);
  @include button-variant(theme-var(background-color),
    theme-var(border-color-base),
    theme-var(text-color-primary));

  // 使用 & {} 包装直接声明以符合新 Sass 规范
  & {
    box-shadow: theme-var(box-shadow-sm);
  }

  // 相邻按钮间距（避免CSS选择器污染）
  &+& {
    margin-left: $spacing-sm;
  }

  // === 主题变体 ===

  // 链接主题：无背景和边框，使用主色
  &.ciallo-theme-link {
    @include button-variant(transparent,
      transparent,
      theme-var(primary-color));

    & {
      box-shadow: none;
    }

    &:hover,
    &:focus {
      text-decoration: underline;
    }
  }

  // 文本主题：无背景和边框，继承文本颜色
  &.ciallo-theme-text {
    @include button-variant(transparent,
      transparent,
      inherit);

    & {
      box-shadow: none;
    }

    &:hover,
    &:focus {
      background: theme-var(background-color-light);
    }
  }

  // === 尺寸变体 ===

  // 小尺寸按钮
  &.ciallo-size-small {
    @include button-size($height-sm, $spacing-xs, $font-size-sm);
  }

  // 大尺寸按钮
  &.ciallo-size-big {
    @include button-size($height-xl, $spacing-lg, $font-size-xxl);
  }

  // === 级别变体（仅适用于button主题）===

  &.ciallo-theme-button {

    // 主要级别：使用主色背景
    &.ciallo-level-main {
      @include button-variant(theme-var(primary-color),
        theme-var(primary-color),
        white);
    }

    // 危险级别：使用错误色背景
    &.ciallo-level-danger {
      @include button-variant(theme-var(error-color),
        theme-var(error-color),
        white);
    }
  }

  // === 链接和文本主题的级别变体 ===

  &.ciallo-theme-link,
  &.ciallo-theme-text {

    // 主要级别：使用主色文本
    &.ciallo-level-main {
      color: theme-var(primary-color);
    }

    // 危险级别：使用错误色文本
    &.ciallo-level-danger {
      color: theme-var(error-color);
    }
  }

  // === 加载状态 ===

  // 加载状态下的样式调整
  &.ciallo-button-loading {
    position: relative;
    pointer-events: none; // 阻止交互

    // 内容透明度降低
    > :not(.ciallo-loading-indicator) {
      opacity: 0.6;
    }
  }

  // 加载指示器动画
  .ciallo-loading-indicator {
    width: 14px;
    height: 14px;
    display: inline-block;
    margin-right: $spacing-xs;
    border-radius: 50%;
    border: 2px solid theme-var(primary-color);
    border-top-color: transparent;
    animation: ciallo-spin 1s infinite linear;
    flex-shrink: 0; // 防止压缩
  }
}

// 旋转动画关键帧
@keyframes ciallo-spin {
  to {
    transform: rotate(360deg);
  }
}

// === 响应式设计 ===

// 小屏幕适配
@media (max-width: 768px) {
  .ciallo-button {

    // 在小屏幕上适当调整间距
    &+& {
      margin-left: $spacing-xs;
    }

    // 大按钮在小屏幕上稍微缩小
    &.ciallo-size-big {
      @include button-size($height-lg, $spacing-md, $font-size-xl);
    }
  }
}

// === 焦点和无障碍访问 ===

.ciallo-button {

  // 高对比度模式支持
  @media (prefers-contrast: high) {
    border-width: 2px;
  }

  // 减少动画偏好支持
  @media (prefers-reduced-motion: reduce) {
    transition: none;

    .ciallo-loading-indicator {
      animation: none;
    }
  }
}
</style>
