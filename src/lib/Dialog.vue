<template>
  <!-- 
    对话框组件
    使用Teleport渲染到body，避免z-index层级问题
    支持点击遮罩层关闭和键盘ESC关闭
  -->
  <template v-if="props.visible">
    <Teleport to="body">
      <!-- 遮罩层：提供背景遮挡和点击关闭功能 -->
      <div class="ciallo-dialog-overlay" @click="onClickOverlay" :aria-hidden="true"></div>

      <!-- 对话框包装器：负责居中定位 -->
      <div class="ciallo-dialog-wrapper">
        <!-- 主对话框：包含所有内容 -->
        <div class="ciallo-dialog" role="dialog" :aria-modal="true" :aria-labelledby="titleId"
          :aria-describedby="contentId" @keydown.esc="onEscapeKey" tabindex="-1" ref="dialogRef">
          <!-- 对话框标题栏 -->
          <header class="ciallo-dialog-header" v-if="$slots.title || props.title">
            <div :id="titleId" class="ciallo-dialog-title">
              <slot name="title">{{ props.title }}</slot>
            </div>
            <!-- 关闭按钮 -->
            <button @click="close" class="ciallo-dialog-close" :aria-label="'关闭对话框'" type="button">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path
                  d="M8.707 8l3.147-3.146a.5.5 0 0 0-.708-.708L8 7.293 4.854 4.146a.5.5 0 1 0-.708.708L7.293 8l-3.147 3.146a.5.5 0 0 0 .708.708L8 8.707l3.146 3.147a.5.5 0 0 0 .708-.708L8.707 8z" />
              </svg>
            </button>
          </header>

          <!-- 对话框内容区域 -->
          <main class="ciallo-dialog-main">
            <div :id="contentId">
              <slot name="content">{{ props.content }}</slot>
            </div>
          </main>

          <!-- 对话框操作按钮区域 -->
          <footer class="ciallo-dialog-footer" v-if="props.showFooter">
            <slot name="footer">
              <!-- 默认操作按钮 -->
              <Button @click="onClickCancel" :disabled="props.loading">
                {{ props.cancelText }}
              </Button>
              <Button level="main" @click="onClickOk" :loading="props.loading">
                {{ props.okText }}
              </Button>
            </slot>
          </footer>
        </div>
      </div>
    </Teleport>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from "vue";
import Button from "./Button.vue";
import type { DialogProps, DialogEmits } from "./types/dialog";

// 组件属性定义
const props = withDefaults(defineProps<DialogProps>(), {
  visible: false,              // 是否显示对话框
  closeOnClickOverlay: true,   // 点击遮罩层是否关闭
  closeOnPressEscape: true,    // 按ESC键是否关闭
  title: '',                   // 标题文本
  content: '',                 // 内容文本
  okText: '确定',              // 确定按钮文本
  cancelText: '取消',          // 取消按钮文本
  showFooter: true,            // 是否显示底部操作区
  loading: false,              // 确定按钮加载状态
});

// 事件发射器
const emit = defineEmits<DialogEmits>();

// ===== 响应式状态 =====
const dialogRef = ref<HTMLElement>();

// ===== 计算属性 =====

// 生成唯一ID，用于无障碍访问
const titleId = computed(() => `ciallo-dialog-title-${Math.random().toString(36).substr(2, 9)}`);
const contentId = computed(() => `ciallo-dialog-content-${Math.random().toString(36).substr(2, 9)}`);

// ===== 核心方法 =====

/**
 * 关闭对话框
 * 统一的关闭方法，确保状态同步
 */
const close = (): void => {
  emit("update:visible", false);
  emit("close");
};

/**
 * 处理遮罩层点击事件
 * 根据配置决定是否关闭对话框
 */
const onClickOverlay = (): void => {
  if (props.closeOnClickOverlay && !props.loading) {
    close();
  }
};

/**
 * 处理ESC键按下事件
 * 提供键盘关闭功能
 */
const onEscapeKey = (): void => {
  if (props.closeOnPressEscape && !props.loading) {
    close();
  }
};

/**
 * 处理确定按钮点击事件
 * 支持异步操作和加载状态
 */
const onClickOk = async (): Promise<void> => {
  try {
    // 如果提供了ok回调函数，执行它
    if (props.ok) {
      const result = await props.ok();
      // 如果回调返回false，不关闭对话框
      if (result === false) {
        return;
      }
    }

    emit("ok");
    close();
  } catch (error) {
    // 处理异步操作错误
    console.error('Dialog ok handler error:', error);
    emit("error", error);
  }
};

/**
 * 处理取消按钮点击事件
 */
const onClickCancel = (): void => {
  if (props.cancel) {
    props.cancel();
  }

  emit("cancel");
  close();
};

// ===== 焦点管理 =====

let previousActiveElement: Element | null = null;

/**
 * 设置焦点到对话框
 * 改善键盘导航体验
 */
const setFocus = (): void => {
  nextTick(() => {
    if (dialogRef.value) {
      // 保存当前焦点元素
      previousActiveElement = document.activeElement;

      // 将焦点设置到对话框
      dialogRef.value.focus();
    }
  });
};

/**
 * 恢复之前的焦点
 * 对话框关闭时恢复用户之前的操作位置
 */
const restoreFocus = (): void => {
  if (previousActiveElement && previousActiveElement instanceof HTMLElement) {
    previousActiveElement.focus();
  }
};

/**
 * 焦点陷阱：确保Tab键只在对话框内循环
 */
const trapFocus = (event: KeyboardEvent): void => {
  if (!dialogRef.value) return;

  const focusableElements = dialogRef.value.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  if (event.key === 'Tab') {
    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
};

// ===== 生命周期管理 =====

// 监听对话框可见性变化
const handleVisibilityChange = (): void => {
  if (props.visible) {
    // 对话框打开时
    setFocus();
    document.addEventListener('keydown', trapFocus);
    // 防止背景滚动
    document.body.style.overflow = 'hidden';
  } else {
    // 对话框关闭时
    restoreFocus();
    document.removeEventListener('keydown', trapFocus);
    // 恢复背景滚动
    document.body.style.overflow = '';
  }
};

// 监听visible属性变化
watch(() => props.visible, handleVisibilityChange);

onMounted(() => {
  if (props.visible) {
    handleVisibilityChange();
  }
});

onUnmounted(() => {
  // 清理事件监听器
  document.removeEventListener('keydown', trapFocus);
  // 恢复页面滚动
  document.body.style.overflow = '';
});
</script>

<style lang="scss">
// 导入设计令牌和混合函数
@use "./tokens/colors.scss" as *;
@use "./tokens/size.scss" as *;
@use "./tokens/css-vars.scss" as *;
@use "./mixins/dialog.scss" as *;

// 对话框样式定义
.ciallo-dialog {

  // 遮罩层样式
  &-overlay {
    @include overlay-base;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px); // 添加背景模糊效果
    animation: ciallo-dialog-fade-in 0.2s ease-out;
  }

  // 对话框包装器样式
  &-wrapper {
    @include dialog-wrapper;
    animation: ciallo-dialog-zoom-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  // 主对话框容器样式
  & {
    @include dialog-content;
    background: theme-var(background-color);
    color: theme-var(text-color-primary);

    // 确保在不同主题下的良好对比度
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06),
      0 0 0 1px theme-var(border-color-light);
  }

  // 标题栏样式
  &-header {
    @include dialog-header;
    border-bottom: 1px solid theme-var(border-color-light);
    background: theme-var(background-color-light);
  }

  // 标题文本样式
  &-title {
    font-weight: 500;
    color: theme-var(text-color-primary);
    flex: 1;
  }

  // 内容区域样式
  &-main {
    @include dialog-main;
    color: theme-var(text-color-secondary);
    max-height: 60vh; // 限制最大高度
    overflow-y: auto; // 内容过多时滚动
  }

  // 底部操作区样式
  &-footer {
    @include dialog-footer;
    border-top: 1px solid theme-var(border-color-light);
    background: theme-var(background-color-light);
    display: flex;
    justify-content: flex-end;
    align-items: center;

    // 按钮间距优化
    .ciallo-button+.ciallo-button {
      margin-left: $spacing-sm;
    }
  }

  // 关闭按钮样式
  &-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    background: transparent;
    border-radius: $border-radius-base;
    color: theme-var(text-color-disabled);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;

    // 悬停状态
    &:hover {
      background: theme-var(background-color-base);
      color: theme-var(text-color-secondary);
      transform: scale(1.1);
    }

    // 激活状态
    &:active {
      transform: scale(0.95);
    }

    // 焦点状态
    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px theme-var(primary-color);
    }

    // SVG图标样式
    svg {
      width: 16px;
      height: 16px;
      transition: transform 0.2s;
    }
  }
}

// === 动画定义 ===

// 遮罩层淡入动画
@keyframes ciallo-dialog-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

// 对话框缩放进入动画
@keyframes ciallo-dialog-zoom-in {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }

  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

// === 响应式设计 ===

// 小屏幕适配
@media (max-width: 768px) {
  .ciallo-dialog {
    // 小屏幕下占满宽度，保留边距
    max-width: calc(100vw - #{$spacing-lg * 2});
    margin: $spacing-lg;

    &-main {
      // 小屏幕下限制内容高度
      max-height: 50vh;
    }

    &-footer {
      // 小屏幕下按钮堆叠，确定按钮在上方
      flex-direction: column !important;
      justify-content: stretch !important;
      align-items: stretch !important;
      gap: $spacing-md;
      padding: $spacing-lg $spacing-xl $spacing-xl;

      .ciallo-button {
        width: 100%;
        margin: 0 !important;
        // 增加移动端按钮高度，提升可点击性
        min-height: 44px;
        font-size: $font-size-base;
        font-weight: 500;
        border-radius: 8px;

        // 主按钮（确定）在上方，样式更突出
        &.ciallo-level-main {
          order: 1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          margin-bottom: $spacing-xs;
        }

        // 次要按钮（取消）在下方
        &:not(.ciallo-level-main) {
          order: 2;
        }
      }
    }
  }
}

// 更小屏幕（手机竖屏）的进一步优化
@media (max-width: 480px) {
  .ciallo-dialog {
    // 极小屏幕下几乎占满整个屏幕
    max-width: calc(100vw - #{$spacing-md * 2});
    margin: $spacing-md;

    &-header {
      padding: $spacing-md $spacing-lg;
    }

    &-main {
      padding: $spacing-lg;
      max-height: 40vh;
    }

    &-footer {
      padding: $spacing-md $spacing-lg $spacing-lg;
      gap: $spacing-sm;

      .ciallo-button {
        // 进一步增加按钮高度
        min-height: 48px;
        font-size: $font-size-lg;
        font-weight: 600;

        // 在极小屏幕上也保持确定按钮的突出效果
        &.ciallo-level-main {
          margin-bottom: $spacing-xs;
        }
      }
    }
  }
}

// === 动画偏好支持 ===

// 减少动画偏好用户的优化
@media (prefers-reduced-motion: reduce) {
  .ciallo-dialog {
    &-overlay {
      animation: none;
    }

    &-wrapper {
      animation: none;
    }

    &-close {
      transition: none;

      &:hover {
        transform: none;
      }

      &:active {
        transform: none;
      }
    }
  }
}

// === 高对比度模式支持 ===

@media (prefers-contrast: high) {
  .ciallo-dialog {
    border: 2px solid;

    &-header,
    &-footer {
      border-width: 2px;
    }

    &-close {
      border: 1px solid;
    }
  }
}

// === 触摸设备优化 ===

@media (hover: none) and (pointer: coarse) {
  .ciallo-dialog {
    &-footer {
      .ciallo-button {

        // 触摸设备上移除悬停效果，增加点击反馈
        &:hover {
          transform: none;
        }

        &:active {
          transform: scale(0.98);
          transition: transform 0.1s ease;
        }
      }
    }

    &-close {
      // 触摸设备上增大关闭按钮的点击区域
      width: 40px;
      height: 40px;

      &:active {
        background: theme-var(background-color-base);
        transform: scale(0.95);
      }
    }
  }
}
</style>
