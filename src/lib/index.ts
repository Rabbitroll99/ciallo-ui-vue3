// ===== 组件导出 =====
export { default as Switch } from "./components/Switch/Switch.vue";
export { default as Button } from "./components/Button/Button.vue";
export { default as Tabs } from "./components/Tabs/Tabs.vue";
export { default as Tab } from "./components/Tabs/Tab.vue";
export { default as Dialog } from "./components/Dialog/Dialog.vue";
export { default as Carousel } from "./components/Carousel/Carousel.vue";

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
