// ===== 组件导出 =====
export { default as Switch } from "./Switch.vue";
export { default as Button } from "./Button.vue";
export { default as Tabs } from "./Tabs.vue";
export { default as Tab } from "./Tab.vue";
export { default as Dialog } from "./Dialog.vue";
export { default as ThemeProvider } from "./ThemeProvider.vue";
export { default as Carousel } from "./Carousel.vue";

// ===== 工具函数导出 =====
export { openDialog } from "./openDialog";

// ===== 类型定义导出 =====
// Button组件相关类型
export type {
  ButtonProps,
  ButtonTheme,
  ButtonSize,
  ButtonLevel,
} from "./types/button";
// Switch组件相关类型
export type { SwitchProps } from "./types/switch";
// Dialog组件相关类型
export type { DialogProps, DialogEmits } from "./types/dialog";
// Tabs组件相关类型
export type { TabsProps, TabsEmits } from "./types/tabs";
// Carousel组件相关类型
export type {
  CarouselProps,
  CarouselEmits,
  CarouselImage,
  CarouselNavigationMode,
} from "./types/carousel";
// 主题相关类型
export type { Theme } from "./ThemeProvider.vue";
