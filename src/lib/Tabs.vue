<template>
  <!-- 
    标签页组件
    支持动态指示器动画和键盘导航
    提供多种样式和位置选项
  -->
  <div class="ciallo-tabs" :class="computedClasses" role="tablist"
    :aria-orientation="isVertical ? 'vertical' : 'horizontal'">
    <!-- 标签导航栏 -->
    <div class="ciallo-tabs-nav" ref="navRef">
      <!-- 标签按钮列表 -->
      <button v-for="(title, index) in titles" :key="title" class="ciallo-tabs-nav-item" :class="{
        'ciallo-tabs-nav-item-selected': title === props.selected,
        'ciallo-tabs-nav-item-closable': props.closable
      }" :ref="(el) => setTabRef(el as HTMLButtonElement, title)" @click="handleTabClick(title)"
        @keydown="handleKeydown($event, index)" :aria-selected="title === props.selected"
        :tabindex="title === props.selected ? 0 : -1" role="tab" :aria-controls="`ciallo-tab-panel-${title}`"
        :id="`ciallo-tab-${title}`" type="button">
        <!-- 标签标题 -->
        <span class="ciallo-tabs-nav-item-text">{{ title }}</span>

        <!-- 关闭按钮 -->
        <button v-if="props.closable" class="ciallo-tabs-nav-item-close" @click.stop="handleTabRemove(title)"
          :aria-label="`关闭 ${title} 标签`" type="button">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path
              d="M6.707 6l2.147-2.146a.5.5 0 1 0-.708-.708L6 5.293 3.854 3.146a.5.5 0 1 0-.708.708L5.293 6l-2.147 2.146a.5.5 0 0 0 .708.708L6 6.707l2.146 2.147a.5.5 0 0 0 .708-.708L6.707 6z" />
          </svg>
        </button>
      </button>

      <!-- 活动指示器 -->
      <div class="ciallo-tabs-nav-indicator" ref="indicatorRef" aria-hidden="true"></div>
    </div>

    <!-- 标签内容区域 -->
    <div class="ciallo-tabs-content">
      <!-- 当前激活的标签面板 -->
      <div v-if="currentTab" :id="`ciallo-tab-panel-${currentTab.props?.title}`"
        :aria-labelledby="`ciallo-tab-${currentTab.props?.title}`" role="tabpanel" class="ciallo-tabs-panel">
        <component :is="currentTab" :key="currentTab.props?.title" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect, onMounted, useSlots, nextTick } from "vue";
import Tab from "./Tab.vue";
import type { TabsProps, TabsEmits } from "./types/tabs";

// 组件属性定义
const props = withDefaults(defineProps<TabsProps>(), {
  type: 'line',           // 标签类型
  position: 'top',        // 标签位置
  closable: false,        // 是否可关闭
});

// 事件发射器
const emit = defineEmits<TabsEmits>();

// ===== 响应式状态 =====
const navRef = ref<HTMLDivElement>();
const indicatorRef = ref<HTMLDivElement>();
const tabRefs = ref<Map<string, HTMLButtonElement>>(new Map());

// 获取插槽内容
const slots = useSlots();

// ===== 计算属性 =====

// 组件CSS类名
const computedClasses = computed(() => ({
  [`ciallo-tabs-${props.type}`]: true,
  [`ciallo-tabs-${props.position}`]: true,
  'ciallo-tabs-closable': props.closable,
}));

// 判断是否为垂直布局
const isVertical = computed(() =>
  props.position === 'left' || props.position === 'right'
);

// 获取默认插槽内容并验证
const defaultSlots = computed(() => {
  const slots_default = slots.default?.() || [];

  // 验证所有子组件都是Tab组件
  slots_default.forEach((tag) => {
    if (tag.type !== Tab) {
      throw new Error("Tabs组件的子组件必须是Tab组件");
    }
  });

  return slots_default;
});

// 提取所有标签标题
const titles = computed(() =>
  defaultSlots.value
    .map((tag) => tag.props?.title)
    .filter(Boolean) as string[]
);

// 获取当前激活的标签
const currentTab = computed(() =>
  defaultSlots.value.find((tag) => tag.props?.title === props.selected)
);

// ===== 核心方法 =====

/**
 * 设置标签元素引用
 * 用于后续的指示器定位计算
 */
const setTabRef = (el: HTMLButtonElement | null, title: string): void => {
  if (el) {
    tabRefs.value.set(title, el);
  } else {
    tabRefs.value.delete(title);
  }
};

/**
 * 更新指示器位置和尺寸
 * 使用RAF优化性能，避免布局抖动
 */
const updateIndicator = (): void => {
  if (!props.selected || !indicatorRef.value || !navRef.value) return;

  const selectedElement = tabRefs.value.get(props.selected);
  if (!selectedElement) return;

  // 使用RAF确保在DOM更新后执行
  requestAnimationFrame(() => {
    const navRect = navRef.value!.getBoundingClientRect();
    const selectedRect = selectedElement.getBoundingClientRect();

    if (isVertical.value) {
      // 垂直布局：控制高度和top位置
      const height = selectedRect.height;
      const top = selectedRect.top - navRect.top;

      indicatorRef.value!.style.width = '3px';
      indicatorRef.value!.style.height = `${height}px`;
      indicatorRef.value!.style.transform = `translateY(${top}px)`;
    } else {
      // 水平布局：控制宽度和left位置
      const width = selectedRect.width;
      const left = selectedRect.left - navRect.left;

      indicatorRef.value!.style.width = `${width}px`;
      indicatorRef.value!.style.height = '3px';
      indicatorRef.value!.style.transform = `translateX(${left}px)`;
    }
  });
};

/**
 * 处理标签点击事件
 */
const handleTabClick = (title: string): void => {
  emit("update:selected", title);
  emit("tab-click", title);
};

/**
 * 处理标签关闭事件
 */
const handleTabRemove = (title: string): void => {
  emit("tab-remove", title);
};

/**
 * 处理键盘导航
 * 支持方向键切换标签
 */
const handleKeydown = (event: KeyboardEvent, currentIndex: number): void => {
  const { key } = event;
  const maxIndex = titles.value.length - 1;
  let targetIndex = currentIndex;

  // 根据布局方向处理键盘事件
  if (isVertical.value) {
    if (key === 'ArrowDown') {
      targetIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
    } else if (key === 'ArrowUp') {
      targetIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex;
    }
  } else {
    if (key === 'ArrowRight') {
      targetIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
    } else if (key === 'ArrowLeft') {
      targetIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex;
    }
  }

  // 如果索引发生变化，切换到目标标签
  if (targetIndex !== currentIndex) {
    event.preventDefault();
    const targetTitle = titles.value[targetIndex];
    handleTabClick(targetTitle);

    // 设置焦点到新的标签
    nextTick(() => {
      const targetElement = tabRefs.value.get(targetTitle);
      targetElement?.focus();
    });
  }

  // Home键：跳转到第一个标签
  if (key === 'Home') {
    event.preventDefault();
    handleTabClick(titles.value[0]);
  }

  // End键：跳转到最后一个标签
  if (key === 'End') {
    event.preventDefault();
    handleTabClick(titles.value[maxIndex]);
  }
};

// ===== 生命周期和监听器 =====

// 监听选中状态变化，更新指示器
watchEffect(() => {
  updateIndicator();
});

// 组件挂载后初始化指示器
onMounted(() => {
  // 确保DOM已渲染完成
  nextTick(() => {
    updateIndicator();
  });

  // 监听窗口大小变化，重新计算指示器位置
  const handleResize = (): void => {
    updateIndicator();
  };

  window.addEventListener('resize', handleResize);

  // 组件卸载时清理事件监听器
  return () => {
    window.removeEventListener('resize', handleResize);
  };
});
</script>

<style lang="scss">
// 导入设计令牌和混合函数
@use "./tokens/colors.scss" as *;
@use "./tokens/size.scss" as *;
@use "./tokens/css-vars.scss" as *;

// === 标签页基础样式 ===
.ciallo-tabs {
  position: relative;

  // === 导航栏样式 ===
  &-nav {
    display: flex;
    position: relative;
    color: theme-var(text-color-primary);
    border-bottom: 1px solid theme-var(border-color-base);

    // 垂直布局时的导航栏样式
    .ciallo-tabs-left &,
    .ciallo-tabs-right & {
      flex-direction: column;
      border-bottom: none;
      border-right: 1px solid theme-var(border-color-base);
      width: 200px; // 垂直标签的固定宽度
    }

    .ciallo-tabs-right & {
      border-right: none;
      border-left: 1px solid theme-var(border-color-base);
    }

    .ciallo-tabs-bottom & {
      border-bottom: none;
      border-top: 1px solid theme-var(border-color-base);
    }
  }

  // === 标签按钮样式 ===
  &-nav-item {
    position: relative;
    display: flex;
    align-items: center;
    padding: $spacing-sm $spacing-lg;
    margin: 0;
    border: none;
    background: transparent;
    color: theme-var(text-color-secondary);
    cursor: pointer;
    white-space: nowrap;
    user-select: none;

    // 过渡动画
    transition:
      color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
      background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1);

    // 焦点样式
    &:focus {
      outline: none;
      background: theme-var(background-color-light);
      box-shadow: inset 0 0 0 2px theme-var(primary-color);
    }

    // 悬停状态
    &:hover:not(&-selected) {
      color: theme-var(primary-color-hover);
      background: theme-var(background-color-light);
    }

    // 选中状态
    &-selected {
      color: theme-var(primary-color);
      font-weight: 500;
    }

    // 标签文本
    &-text {
      flex: 1;
      text-align: left;

      .ciallo-tabs-nav-item-closable & {
        margin-right: $spacing-xs;
      }
    }

    // 关闭按钮
    &-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      padding: 0;
      border: none;
      background: transparent;
      border-radius: 50%;
      color: theme-var(text-color-disabled);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: theme-var(error-color);
        color: white;
        transform: scale(1.1);
      }

      &:focus {
        outline: none;
        box-shadow: 0 0 0 2px theme-var(error-color);
      }
    }

    // 垂直布局时的样式调整
    .ciallo-tabs-left &,
    .ciallo-tabs-right & {
      justify-content: flex-start;
      width: 100%;
      text-align: left;
    }
  }

  // === 指示器样式 ===
  &-nav-indicator {
    position: absolute;
    background: theme-var(primary-color);
    border-radius: 2px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1;

    // 默认水平位置（底部）
    bottom: 0;
    left: 0;
    height: 3px;

    // 顶部位置
    .ciallo-tabs-top & {
      bottom: 0;
    }

    // 底部位置  
    .ciallo-tabs-bottom & {
      top: 0;
      bottom: auto;
    }

    // 左侧位置
    .ciallo-tabs-left & {
      right: 0;
      bottom: auto;
      width: 3px !important;
      height: auto;
    }

    // 右侧位置
    .ciallo-tabs-right & {
      left: 0;
      bottom: auto;
      width: 3px !important;
      height: auto;
    }
  }

  // === 内容区域样式 ===
  &-content {
    padding: $spacing-lg 0;

    // 垂直布局时的内容区域
    .ciallo-tabs-left &,
    .ciallo-tabs-right & {
      flex: 1;
      padding: 0 $spacing-lg;
    }
  }

  // 标签面板
  &-panel {
    outline: none; // 移除焦点轮廓，通过其他方式处理无障碍访问
  }

  // === 卡片类型样式 ===
  &.ciallo-tabs-card {
    .ciallo-tabs-nav {
      background: theme-var(background-color-light);
      border-radius: $border-radius-base $border-radius-base 0 0;

      &-item {
        border: 1px solid theme-var(border-color-base);
        border-bottom: none;
        margin-right: -1px;
        border-radius: $border-radius-base $border-radius-base 0 0;
        background: theme-var(background-color-base);

        &:first-child {
          border-left: 1px solid theme-var(border-color-base);
        }

        &-selected {
          background: theme-var(background-color);
          border-bottom: 1px solid theme-var(background-color);
          z-index: 2;
        }
      }
    }

    // 卡片类型不显示指示器
    .ciallo-tabs-nav-indicator {
      display: none;
    }

    .ciallo-tabs-content {
      background: theme-var(background-color);
      border: 1px solid theme-var(border-color-base);
      border-top: none;
      border-radius: 0 0 $border-radius-base $border-radius-base;
      padding: $spacing-lg;
    }
  }

  // === 垂直布局样式 ===
  &.ciallo-tabs-left,
  &.ciallo-tabs-right {
    display: flex;

    .ciallo-tabs-content {
      flex: 1;
    }
  }

  &.ciallo-tabs-right {
    flex-direction: row-reverse;
  }
}

// === 响应式设计 ===

// 小屏幕适配
@media (max-width: 768px) {
  .ciallo-tabs {
    &-nav {
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;

      &::-webkit-scrollbar {
        display: none;
      }

      &-item {
        flex-shrink: 0;
        min-width: 80px;
      }
    }

    // 强制使用顶部布局
    &.ciallo-tabs-left,
    &.ciallo-tabs-right {
      display: block;

      .ciallo-tabs-nav {
        flex-direction: row;
        width: auto;
        border-right: none;
        border-left: none;
        border-bottom: 1px solid theme-var(border-color-base);
      }

      .ciallo-tabs-content {
        padding: $spacing-lg 0;
      }
    }
  }
}

// === 减少动画偏好支持 ===
@media (prefers-reduced-motion: reduce) {
  .ciallo-tabs {

    &-nav-item,
    &-nav-indicator {
      transition: none;
    }
  }
}

// === 高对比度模式支持 ===
@media (prefers-contrast: high) {
  .ciallo-tabs {
    &-nav {
      border-width: 2px;
    }

    &-nav-item {
      &:focus {
        box-shadow: inset 0 0 0 3px;
      }
    }
  }
}
</style>
